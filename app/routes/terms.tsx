import TermsOfUsePage from '~/components/TermsOfUsePage';

export function meta() {
  return [
    { title: 'Умови використання | Магазин Mebel' },
    {
      name: 'description',
      content: 'Умови використання сайту магазину Mebel.',
    },
    { name: 'robots', content: 'index, follow' },
  ];
}

export default function TermsRoute() {
  return <TermsOfUsePage />;
}
