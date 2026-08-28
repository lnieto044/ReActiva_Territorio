import { useOffers } from '../features/offers/api';
import { OfferForm } from '../features/offers/OfferForm';
import { OfferList } from '../features/offers/OfferList';
import { RequireRole } from '../components/RequireRole';
import { puedePublicarOferta } from '../domain/permissions';

export function OfertasPage() {
  const { offers, loading } = useOffers();

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <RequireRole
        allow={puedePublicarOferta}
        mensaje="Publicar ofertas es para empresas, entidades y organizaciones. Como líder comunitario puedes ver las ofertas disponibles a la derecha."
      >
        <OfferForm />
      </RequireRole>
      <div>
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Ofertas publicadas</h2>
        {loading ? <p className="text-stone-400">Cargando…</p> : <OfferList offers={offers} />}
      </div>
    </div>
  );
}
