import MockupPage from '../../components/MockupPage';

export default function PlataTaxe() {
  return (
    <MockupPage
      icon="payments"
      title="Plata Taxe"
      description="Gestionează taxele de școlarizare și restanțele, efectuează plăți online în siguranță și consultă istoricul tranzacțiilor."
      features={[
        { icon: 'school', label: 'Taxe școlarizare' },
        { icon: 'event_busy', label: 'Restanțe' },
        { icon: 'credit_card', label: 'Plată online' },
        { icon: 'receipt_long', label: 'Istoric plăți' },
      ]}
    />
  );
}
