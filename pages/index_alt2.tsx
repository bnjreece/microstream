import { GetServerSideProps } from 'next';

export default function Home() {
  return <div>Redirecting...</div>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.writeHead(302, { Location: 'https://github.com/bnjreece/microstream' });
  context.res.end();
  return { props: {} };
};
