# Bonus: jak korzystać z cache'a w agentach kodujących

Prompt caching jest prosty w teorii: provider potrafi ponownie wykorzystać wcześniej przetworzony początek promptu. W agentach kodujących ma to duże znaczenie, bo każda kolejna tura niesie ze sobą sporo kontekstu: instrukcje systemowe, definicje narzędzi, reguły repozytorium, historię rozmowy, wyniki komend i nową prośbę. Jeżeli początek tego pakietu pozostaje stabilny, kolejne kroki mogą być tańsze i szybsze. Jeżeli w połowie pracy zmieniamy model, effort, narzędzia albo sposób składania promptu, bardzo łatwo wrócić do płacenia za ten sam kontekst od zera.

Najkrótsza zasada brzmi: ustal konfigurację na początku, trzymaj stałe instrukcje wysoko w kontekście, a zmienne wyniki pracy dopisuj później. Cache nie jest przełącznikiem, który magicznie naprawia chaotyczną sesję. To raczej efekt uboczny dobrze prowadzonej pracy: stabilny start, przewidywalne reguły i możliwie mało przypadkowych zmian w środku zadania.

## Zacznij od stabilnej konfiguracji

Pierwsza część sesji powinna przypominać przygotowanie stanowiska pracy. Agent ma wiedzieć, gdzie jest, jakimi narzędziami pracuje i po czym poznaje, że zadanie jest skończone. To jest moment, w którym warto jasno ustalić repozytorium, model, effort, dostępne MCP, tryb pracy i kryterium zakończenia.

Najgorszy wariant to zacząć od chaotycznej eksploracji, po kilku turach podłączyć dodatkowy serwer MCP, potem zmienić model, a na końcu zrobić kompakcję w środku debugowania. Każda z tych zmian może być uzasadniona, ale razem sprawiają, że sesja przestaje mieć stabilny początek. Z perspektywy cache'a wygląda to tak, jakbyśmy co chwilę przebudowywali fundament.

Dobry start nie musi być długi. Wystarczy, że stałe reguły pojawiają się wcześnie i są sformułowane raz, zamiast wracać w różnych wariantach po kolejnych logach i wynikach narzędzi. Dopiero później powinny dochodzić elementy zmienne: wynik eksploracji, błąd testu, fragment stack trace'a, decyzja po review albo rezultat komendy.

## Przenieś powtarzalne zasady do plików

Jeżeli co drugą sesję wklejasz agentowi ten sam zestaw instrukcji, to nie masz procesu, tylko rytuał kopiuj-wklej. Lepsze miejsce na powtarzalne reguły to `AGENTS.md`, README, plan testów albo osobny playbook.

W repozytorium testowym dobrym przykładem są zasady UI testów. Informacje o Page Object Model, preferowaniu `data-testid`, układzie given / when / then, uruchamianiu nowego testu przed pełnym pakietem i aktualizowaniu planu testów powinny żyć w stałym pliku. Dzięki temu agent szybciej łapie lokalny styl pracy, a Ty nie musisz za każdym razem odtwarzać całego kontekstu ręcznie.

Z perspektywy cache'a to też jest zdrowsze. Stałe instrukcje mają stałe miejsce, zamiast pojawiać się raz na początku, raz po logach, a raz między dwoma stack trace'ami. Im mniej ręcznie składanego kontekstu, tym mniejsza szansa, że przypadkowo zmienisz prefiks i osłabisz cache.

## Nie zmieniaj środowiska w środku sprintu

Claude Code docs bardzo konkretnie pokazują, że model i effort są częścią cache key, a zmiany w narzędziach, MCP, pluginach czy kompakcji potrafią przesunąć sesję na nową granicę cache'a. OpenAI opisuje ten sam mechanizm niżej, na poziomie prefiksu: cache działa wtedy, gdy początek promptu się zgadza.

W długiej sesji warto więc traktować zmianę modelu, effortu, zestawu narzędzi, pluginów, katalogu roboczego albo worktree jak zmianę etapu, a nie jak neutralny szczegół. Podobnie jest z `/compact` w środku debugowania: czasem pomaga odzyskać miejsce w kontekście, ale zastępuje historię streszczeniem i zmienia dalszy przebieg pracy.

Najbardziej praktyczna wersja tej zasady wygląda tak:

| Zmiana | Co zwykle oznacza |
| --- | --- |
| Zmiana modelu | osobny cache dla nowej konfiguracji |
| Zmiana effort / reasoning | nowy wariant pracy modelu |
| Podłączenie MCP w trakcie zadania | inny zestaw narzędzi w kontekście |
| Włączenie albo wyłączenie pluginu | potencjalna zmiana tool definitions |
| `/compact` w środku debugowania | historia zostaje zastąpiona streszczeniem |
| Upgrade narzędzia kodującego | możliwa zmiana system promptu |
| Start w innym katalogu lub worktree | inny kontekst roboczy |

Nie chodzi o to, że takich rzeczy nigdy nie wolno robić. Czasem trzeba. Chodzi o moment. Jeżeli zmiana jest potrzebna, zrób krótki handoff: co robimy, jakie pliki zostały zmienione, jakie testy przeszły i co jest następnym krokiem. Potem potraktuj dalszą pracę jak nowy etap, a nie kontynuację tej samej stabilnej sesji.

## Co można robić bez paniki

Nie każda aktywność agenta psuje cache. Normalna praca w repozytorium zwykle dopisuje nowe fakty do rozmowy, ale nie musi zmieniać jej stabilnego początku. Edycja plików, uruchamianie testów, czytanie kolejnych plików, korzystanie ze skilli czy komend, a nawet spawn subagenta nie muszą same z siebie niszczyć prefiksu głównego wątku.

To jest ważne praktycznie, bo celem nie jest sparaliżowanie pracy agenta. Agent nadal ma czytać, edytować, odpalać testy i poprawiać błędy. Różnica polega na tym, żeby nie zmieniać konfiguracji stanowiska przy każdej turze. Stabilna sesja może być bardzo aktywna, o ile jej fundament pozostaje ten sam.

## Jak poznać, że robisz to dobrze

Jeżeli korzystasz z API, patrz na metryki: `cached_tokens`, cache read/write tokens, output tokens i time to first token. Jeżeli używasz gotowego narzędzia, często nie zobaczysz pełnej telemetrii, ale nadal możesz obserwować objawy. Pierwsza tura po zmianie modelu będzie zwykle droższa lub wolniejsza. Stabilna, długa sesja powinna po rozgrzaniu działać płynniej. Kompakcja albo zmiana toolsetu może wyraźnie zmienić charakter kolejnej tury.

Gdy cache hit rate jest słaby, najpierw sprawdź początek promptu. Czy naprawdę zaczyna się od tych samych instrukcji? Czy model, effort i narzędzia są stabilne? Czy nie kompaktujesz w połowie debugowania? Zwykle problem nie leży w samym providerze, tylko w tym, jak składamy kontekst.

## Najbardziej praktyczna wersja

Jeżeli miałbym sprowadzić to do jednej rutyny, wyglądałaby tak: zacznij od stabilnego ustawienia sesji, trzymaj reguły repozytorium w plikach, nie zmieniaj modelu ani narzędzi w środku pracy, a większe zmiany konfiguracji traktuj jak nowy etap z krótkim handoffem.

Wtedy prompt caching przestaje być abstrakcyjną funkcją providera. Staje się po prostu efektem dobrego prowadzenia pracy agenta.

## Źródła

- Claude Code docs, prompt caching: <https://code.claude.com/docs/en/prompt-caching>
- OpenAI API docs, prompt caching: <https://developers.openai.com/api/docs/guides/prompt-caching>
- OpenAI, "Unrolling the Codex agent loop": <https://openai.com/index/unrolling-the-codex-agent-loop/>
- Claude API docs, prompt caching: <https://platform.claude.com/docs/en/build-with-claude/prompt-caching>
- "Don't Break the Cache: An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks": <https://arxiv.org/html/2601.06007v2>

Stan na: 2026-06-24.
