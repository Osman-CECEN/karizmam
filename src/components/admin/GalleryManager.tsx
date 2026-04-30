"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  createGalleryItem,
  deleteGalleryItem,
  setGalleryItemActive,
  updateGalleryItem,
  type GalleryInput,
} from "@/app/admin/gallery/actions";
import { createClient } from "@/lib/supabase/client";
import {
  buildGalleryObjectPath,
  parseGalleryStoragePathFromPublicUrl,
  turkishStorageErrorMessage,
  validateGalleryImageFile,
} from "@/lib/gallery/galleryImageStorage";
import type { GalleryItemRow } from "@/types/database";

function emptyForm(): GalleryInput {
  return {
    title: "",
    alt_text: "",
    sort_order: 0,
    is_active: true,
    image_url: null,
  };
}

function rowToForm(row: GalleryItemRow): GalleryInput {
  return {
    title: row.title,
    alt_text: row.alt_text ?? "",
    sort_order: row.sort_order,
    is_active: row.is_active,
    image_url: row.image_url,
  };
}

type Props = {
  initialRows: GalleryItemRow[];
  listError: string | null;
};

async function uploadGalleryImageClient(
  itemId: string,
  file: File
): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
  const err = validateGalleryImageFile(file);
  if (err) return { ok: false, error: err };

  const supabase = createClient();
  if (!supabase) {
    return { ok: false, error: "Depolama yapılandırılmamış (Supabase anahtarları)." };
  }

  const path = buildGalleryObjectPath(itemId, file);
  if (!path) {
    return { ok: false, error: "Dosya türü desteklenmiyor." };
  }

  const { error } = await supabase.storage.from("gallery").upload(path, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    return { ok: false, error: turkishStorageErrorMessage(error.message) };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("gallery").getPublicUrl(path);
  return { ok: true, publicUrl };
}

async function removeStorageObjectIfInBucket(publicUrl: string): Promise<void> {
  const path = parseGalleryStoragePathFromPublicUrl(publicUrl);
  if (!path) return;
  const supabase = createClient();
  if (!supabase) return;
  const { error } = await supabase.storage.from("gallery").remove([path]);
  if (error) {
    console.warn("[gallery] Eski dosya silinemedi:", error.message);
  }
}

export function GalleryManager({ initialRows, listError }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "edit"; row: GalleryItemRow } | null
  >(null);
  const [form, setForm] = useState<GalleryInput>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const beforePickRef = useRef<{ image_url: string | null; imageRemoved: boolean }>({
    image_url: null,
    imageRemoved: false,
  });

  const browserSupabaseConfigured = useMemo(() => createClient() !== null, []);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    };
  }, [previewObjectUrl]);

  function resetImageState() {
    setSelectedFile(null);
    setImageRemoved(false);
    setPreviewObjectUrl(null);
  }

  function openCreate() {
    resetImageState();
    beforePickRef.current = { image_url: null, imageRemoved: false };
    setForm(emptyForm());
    setFormError(null);
    setDialog({ mode: "create" });
  }

  function openEdit(row: GalleryItemRow) {
    resetImageState();
    beforePickRef.current = {
      image_url: row.image_url,
      imageRemoved: false,
    };
    setForm(rowToForm(row));
    setFormError(null);
    setDialog({ mode: "edit", row });
  }

  function closeDialog() {
    resetImageState();
    setDialog(null);
    setFormError(null);
  }

  function onPickFile(file: File | null) {
    if (!file) return;
    const err = validateGalleryImageFile(file);
    if (err) {
      setFormError(err);
      return;
    }
    beforePickRef.current = {
      image_url: form.image_url,
      imageRemoved,
    };
    setFormError(null);
    setImageRemoved(false);
    setSelectedFile(file);
    setPreviewObjectUrl(URL.createObjectURL(file));
  }

  function cancelPendingFilePick() {
    setSelectedFile(null);
    setPreviewObjectUrl(null);
    const snap = beforePickRef.current;
    setForm((f) => ({ ...f, image_url: snap.image_url }));
    setImageRemoved(snap.imageRemoved);
    setFormError(null);
  }

  function clearPhoto() {
    setSelectedFile(null);
    setImageRemoved(true);
    setForm((f) => ({ ...f, image_url: null }));
    setPreviewObjectUrl(null);
    setFormError(null);
  }

  function handleRemovePhoto() {
    if (previewObjectUrl || selectedFile) {
      cancelPendingFilePick();
      return;
    }
    clearPhoto();
  }

  function validate(): string | null {
    if (!form.title.trim()) return "Başlık zorunludur.";
    if (Number.isNaN(form.sort_order)) {
      return "Sıra numarası geçerli bir sayı olmalıdır.";
    }
    return null;
  }

  function save() {
    const v = validate();
    if (v) {
      setFormError(v);
      return;
    }

    if (dialog?.mode === "create" && !selectedFile) {
      setFormError("Yeni öğe için bir görsel dosyası seçmelisiniz.");
      return;
    }

    if (dialog?.mode === "edit") {
      const hadImage = Boolean(dialog.row.image_url?.trim());
      if (!hadImage && !selectedFile && imageRemoved) {
        setFormError("Bu kayıt için en az bir görsel yüklenmelidir.");
        return;
      }
      if (!hadImage && !selectedFile && !form.image_url?.trim()) {
        setFormError("Görsel yükleyin veya mevcut görseli koruyun.");
        return;
      }
    }

    startTransition(async () => {
      const supabase = createClient();
      if (selectedFile && !supabase) {
        setFormError("Yükleme için tarayıcıda Supabase yapılandırması gerekir.");
        return;
      }

      if (dialog?.mode === "create") {
        const res = await createGalleryItem({ ...form, image_url: null });
        if (!res.ok || !res.id) {
          setFormError(res.error ?? "Kayıt oluşturulamadı.");
          return;
        }
        const newId = res.id;

        if (selectedFile) {
          setUploading(true);
          const up = await uploadGalleryImageClient(newId, selectedFile);
          setUploading(false);
          if (!up.ok) {
            setFormError(up.error);
            await deleteGalleryItem(newId);
            return;
          }
          const upd = await updateGalleryItem(newId, {
            ...form,
            image_url: up.publicUrl,
          });
          if (!upd.ok) {
            setFormError(upd.error ?? "Görsel adresi kaydedilemedi.");
            await deleteGalleryItem(newId);
            return;
          }
        }

        closeDialog();
        router.refresh();
        return;
      }

      if (dialog?.mode === "edit") {
        const oldUrl = dialog.row.image_url?.trim() || null;
        let nextImage: string | null = form.image_url;

        if (selectedFile) {
          setUploading(true);
          const up = await uploadGalleryImageClient(dialog.row.id, selectedFile);
          setUploading(false);
          if (!up.ok) {
            setFormError(up.error);
            return;
          }
          nextImage = up.publicUrl;
        } else if (imageRemoved) {
          nextImage = null;
        }

        const res = await updateGalleryItem(dialog.row.id, {
          ...form,
          image_url: nextImage,
        });
        if (!res.ok) {
          setFormError(res.error ?? "Güncellenemedi.");
          return;
        }

        if (
          oldUrl &&
          parseGalleryStoragePathFromPublicUrl(oldUrl) &&
          oldUrl !== (nextImage ?? "")
        ) {
          await removeStorageObjectIfInBucket(oldUrl);
        }

        closeDialog();
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    if (!window.confirm("Bu galeri öğesini silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      const res = await deleteGalleryItem(id);
      if (!res.ok) {
        alert(res.error ?? "Silinemedi.");
        return;
      }
      router.refresh();
    });
  }

  function toggleActive(row: GalleryItemRow) {
    startTransition(async () => {
      const res = await setGalleryItemActive(row.id, !row.is_active);
      if (!res.ok) {
        alert(res.error ?? "Durum güncellenemedi.");
        return;
      }
      router.refresh();
    });
  }

  const busy = pending || uploading;
  const showPreview = Boolean(previewObjectUrl);
  const showExisting =
    !showPreview && !imageRemoved && Boolean(form.image_url?.trim());
  const hasPhotoOrPreview =
    Boolean(previewObjectUrl) ||
    (Boolean(form.image_url?.trim()) && !imageRemoved);
  const noPhotoUi = !hasPhotoOrPreview;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Galeri</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Ana sayfadaki galeri bölümü buradaki aktif kayıtlardan beslenir.
            Görseller Supabase Storage (gallery) içine yüklenir.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-[#111111] hover:bg-[#eab308]"
        >
          Yeni görsel
        </button>
      </div>

      {listError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {listError}
        </p>
      ) : null}

      {initialRows.length === 0 && !listError ? (
        <p className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-10 text-center text-sm text-neutral-600">
          Henüz galeri öğesi yok. “Yeni görsel” ile ekleyebilirsiniz.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-[800px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-3 py-3 font-semibold">Önizleme</th>
                <th className="px-3 py-3 font-semibold">Başlık</th>
                <th className="px-3 py-3 font-semibold">Alt metin</th>
                <th className="px-3 py-3 font-semibold">Sıra</th>
                <th className="px-3 py-3 font-semibold">Aktif</th>
                <th className="px-3 py-3 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {initialRows.map((row) => (
                <tr key={row.id} className="border-b border-neutral-100">
                  <td className="px-3 py-2">
                    <div className="relative size-14 overflow-hidden rounded-lg bg-neutral-100">
                      {row.image_url?.trim() ? (
                        <Image
                          src={row.image_url.trim()}
                          alt={row.alt_text?.trim() || row.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                          loading="lazy"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-neutral-400">
                          Görsel yok
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium text-[#111111]">
                    {row.title}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-neutral-600">
                    {row.alt_text?.trim() || "—"}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{row.sort_order}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => toggleActive(row)}
                      className="rounded border border-neutral-200 px-2 py-1 text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50"
                    >
                      {row.is_active ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="mr-2 font-medium text-[#0B2A4A] hover:underline"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(row.id)}
                      disabled={pending}
                      className="font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialog ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#111111]">
              {dialog.mode === "create" ? "Yeni galeri görseli" : "Görseli düzenle"}
            </h2>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Başlık *</label>
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Alt metin (SEO)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={form.alt_text}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, alt_text: e.target.value }))
                  }
                  disabled={busy}
                  placeholder="Boş bırakılırsa sitede başlık kullanılır"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sıra</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sort_order: Number.parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  disabled={busy}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                  disabled={busy}
                />
                Aktif (yayında)
              </label>

              <div>
                <span className="text-sm font-medium" id="gallery-photo-label">
                  Fotoğraf
                </span>
                <p
                  id="gallery-photo-hint"
                  className="mt-0.5 text-xs text-neutral-500"
                >
                  JPEG, PNG veya WebP — en fazla 2 MB. Depo:{" "}
                  <code className="rounded bg-neutral-100 px-1">gallery</code> /{" "}
                  <code className="rounded bg-neutral-100 px-1 text-[11px]">
                    {"{id}/{timestamp}-dosya.webp"}
                  </code>
                </p>
                {!browserSupabaseConfigured ? (
                  <p className="mt-2 text-sm text-amber-800">
                    Ortam değişkenleri eksik; fotoğraf yüklenemez.
                  </p>
                ) : null}

                <input
                  ref={photoInputRef}
                  id="gallery-photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  className="sr-only"
                  tabIndex={-1}
                  disabled={busy || !browserSupabaseConfigured}
                  aria-labelledby="gallery-photo-label gallery-photo-hint"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.target.value = "";
                    if (f) onPickFile(f);
                  }}
                />

                {uploading ? (
                  <p className="mt-2 text-sm font-medium text-[#0B2A4A]">
                    Fotoğraf yükleniyor…
                  </p>
                ) : null}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="relative h-44 w-full max-w-[220px] shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                    {showPreview && previewObjectUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewObjectUrl}
                        alt="Seçilen fotoğraf önizlemesi"
                        className="h-full w-full object-cover"
                      />
                    ) : showExisting && form.image_url ? (
                      <Image
                        src={form.image_url.trim()}
                        alt="Mevcut fotoğraf"
                        fill
                        className="object-cover"
                        sizes="220px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-xs text-neutral-500">
                        Fotoğraf seçilmedi
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy || !browserSupabaseConfigured}
                      aria-controls="gallery-photo-input"
                      aria-describedby="gallery-photo-hint"
                      onClick={() => photoInputRef.current?.click()}
                      className={`inline-flex w-fit rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                        busy || !browserSupabaseConfigured
                          ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                          : "cursor-pointer border-[#FACC15] bg-[#FACC15] text-[#111111] hover:bg-[#eab308]"
                      }`}
                    >
                      {noPhotoUi ? "Fotoğraf seç" : "Fotoğrafı değiştir"}
                    </button>
                    {!noPhotoUi ? (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={busy || !browserSupabaseConfigured}
                        className="w-fit rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                      >
                        Fotoğrafı kaldır
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {formError ? (
              <p className="mt-3 text-sm font-medium text-red-600">{formError}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
                disabled={busy}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={save}
                disabled={busy}
                className="rounded-lg bg-[#111111] px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {uploading
                  ? "Yükleniyor…"
                  : pending
                    ? "Kaydediliyor…"
                    : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
