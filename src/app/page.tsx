import { Header } from '@/components/layout/header';
import TournamentDetails from '@/components/tournaments/tournament-details';
import TournamentList from '@/components/tournaments/tournament-list';
import WalletHistory from '@/components/wallet/wallet-history';
import { getTournaments, getTransactions } from '@/lib/data';

export default async function Home({
  searchParams,
}: {
  searchParams: { tournamentId?: string };
}) {
  const tournaments = await getTournaments();
  const transactions = await getTransactions();

  const selectedTournamentId =
    searchParams.tournamentId ?? tournaments[0]?.id ?? null;
  const selectedTournament =
    tournaments.find((t) => t.id === selectedTournamentId) ?? tournaments[0];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-screen-2xl mx-auto">
          <aside className="lg:col-span-4 xl:col-span-3">
            <TournamentList
              tournaments={tournaments}
              activeTournamentId={selectedTournamentId}
            />
          </aside>
          <section className="lg:col-span-8 xl:col-span-5">
            {selectedTournament ? (
              <TournamentDetails tournament={selectedTournament} />
            ) : (
              <div className="flex items-center justify-center h-full rounded-lg bg-card border">
                <p className="text-muted-foreground">Select a tournament to see details</p>
              </div>
            )}
          </section>
          <aside className="lg:col-span-12 xl:col-span-4">
            <WalletHistory transactions={transactions} />
          </aside>
        </div>
      </main>
    </div>
  );
}
