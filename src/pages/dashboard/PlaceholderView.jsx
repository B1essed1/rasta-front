import React from 'react';
import { I } from '../../components/ui/Icons';
import { t } from '../../i18n';

export function ChatsView() {
  return (
    <div className="empty-state">
      <div className="es-ic">{I.chat({ width: 26, height: 26 })}</div>
      <h3>{t('db_chats')}</h3>
      <p style={{ color: '#888' }}>{t('db_coming_soon')}</p>
    </div>
  );
}

export function InventoryView() {
  return (
    <div className="empty-state">
      <div className="es-ic">{I.box({ width: 26, height: 26 })}</div>
      <h3>{t('db_inventory')}</h3>
      <p style={{ color: '#888' }}>{t('db_coming_soon')}</p>
    </div>
  );
}

export function ScanView() {
  return (
    <div className="empty-state">
      <div className="es-ic">{I.scan({ width: 26, height: 26 })}</div>
      <h3>{t('db_scan')}</h3>
      <p style={{ color: '#888' }}>{t('db_coming_soon')}</p>
    </div>
  );
}

export function DashboardNotFound() {
  return (
    <div className="empty-state">
      <div className="es-ic">{I.search ? I.search({ width: 26, height: 26 }) : I.eye({ width: 26, height: 26 })}</div>
      <h3>{t('db_not_found_t')}</h3>
      <p style={{ color: '#888' }}>{t('db_not_found_d')}</p>
    </div>
  );
}
