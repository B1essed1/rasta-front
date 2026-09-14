import React, { useRef, useState } from 'react';
import { I } from './Icons';
import { t } from '../../i18n';
import api from '../../api/client';

// Stands in for the design's <image-slot> web component, whose drag/drop/browse
// UI lives in a shadow DOM we cannot reuse. Same job: click or drop an image,
// upload it, hand back the URL. Sits inside .img-cell, which supplies the frame.
export default function PhotoSlot({ url, placeholder, onUploaded, onClear }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  async function upload(file) {
    if (!file || busy) return;
    if (!/^image\//.test(file.type)) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const next = res.data?.url || res.data;
      if (next) onUploaded(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={'ps' + (over ? ' over' : '') + (busy ? ' busy' : '')}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files?.[0]); }}
    >
      {url ? <img src={url} alt="" /> : (
        <span className="ps-ph">
          {I.camera({ width: 20, height: 20 })}
          <b>{placeholder}</b>
        </span>
      )}
      {url && onClear && (
        <button
          type="button"
          className="ps-clear"
          aria-label={t('g_delete')}
          onClick={(e) => { e.stopPropagation(); onClear(); }}
        >
          {I.x({ width: 13, height: 13 })}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }}
      />
    </div>
  );
}
