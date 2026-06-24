# Bonus: jak korzystać z cache'a w agentach kodujących

Prompt caching jest prosty w teorii: provider potrafi ponownie wykorzystać wcześniej przetworzony początek promptu. W agentach kodujących ma to duże znaczenie, bo każda kolejna tura niesie ze sobą sporo kontekstu: instrukcje systemowe, definicje narzędzi, reguły repozytorium, historię rozmowy, wyniki komend i nową prośbę. Jeżeli początek tego pakietu pozostaje stabilny, kolejne kroki mogą być tańsze i szybsze. Jeżeli w połowie pracy zmieniamy model, effort, narzędzia albo sposób składania promptu, bardzo łatwo wrócić do płacenia za ten sam kontekst od zera.

Najkrótsza zasada brzmi:

> Ustal konfigurację na początku, trzymaj stałe instrukcje wysoko w kontekście, a zmienne wyniki pracy doklejaj na końcu.

W praktyce cache nie jest przełącznikiem, tylko stylem prowadzenia sesji. Dobry agentowy workflow zaczyna się spokojnie: wybierasz model, ustawiasz effort, upewniasz się, że potrzebne MCP i narzędzia są dostępne, a potem dopiero dajesz agentowi zadanie. Najgorszy wariant to zacząć od chaotycznej eksploracji, po kilku turach podłączyć dodatkowy serwer MCP, potem zmienić model, a na końcu dziwić się, że długa sesja zaczęła kosztować więcej niż powinna.

## Zacznij od stabilnej konfiguracji

Pierwsza część sesji powinna przypominać przygotowanie stanowiska pracy. Agent ma wiedzieć, gdzie jest, jakimi narzędziami pracuje i po czym poznaje, że zadanie jest skończone. To jest ten moment, w którym warto jasno powiedzieć: pracujemy w tym repozytorium, tym modelem, z takim effortem, z takim zestawem narzędzi i według takich reguł.

Dobry prompt startowy nie musi być długi. Ważne, żeby zawierał stabilne elementy:

```text
Cel: dodaj test UI Playwright dla ścieżki checkout happy path.

Stały kontekst:
- użyj AGENTS.md;
- trzymaj się Page Object Model;
- preferuj data-testid;
- test ma mieć układ given / when / then;
- nowy test uruchom pierwszy, potem npm run test:ui.

Najpierw zwróć krótki plan. Nie edytuj plików przed planem.
```

To działa z dwóch powodów. Po pierwsze, agent dostaje jasne granice zadania. Po drugie, najważniejsze reguły pojawiają się wcześnie i mogą zostać stabilną częścią prefiksu. Później do rozmowy dochodzą już rzeczy zmienne: wynik eksploracji, błędy testów, fragmenty logów, decyzje po drodze.

## Przenieś powtarzalne zasady do plików

Jeżeli co drugą sesję wklejasz agentowi ten sam zestaw instrukcji, to nie masz procesu, tylko rytuał kopiuj-wklej. Lepsze miejsce na powtarzalne reguły to `AGENTS.md`, README, plan testów albo osobny playbook.

W tym repozytorium dobrym przykładem są reguły UI testów. Nie powinny żyć wyłącznie w promptach. Lepiej zapisać je raz:

```markdown
## UI tests

- Explore the tested page first with Playwright CLI.
- Prefer data-testid selectors.
- Use given / when / then structure.
- Use Page Object Model.
- Add pages to /pages and components to /components.
- Run the newly created test first, then npm run test:ui.
- Update e2e-ui-test-implementation-plan.md after adding a new suite.
```

Taki zapis pomaga jakościowo i organizacyjnie. Agent szybciej łapie lokalny styl pracy, a Ty nie musisz za każdym razem budować całego kontekstu ręcznie. Z perspektywy cache'a to też jest zdrowsze: stałe instrukcje mają stałe miejsce, zamiast pojawiać się raz na początku, raz po logach, a raz między dwoma stack trace'ami.

## Nie zmieniaj środowiska w środku sprintu

Claude Code docs bardzo konkretnie pokazują, że model i effort są częścią cache key, a zmiany w narzędziach, MCP, pluginach czy kompakcji potrafią przesunąć sesję na nową granicę cache'a. OpenAI opisuje ten sam mechanizm niżej, na poziomie prefiksu: cache działa wtedy, gdy początek promptu się zgadza.

Dlatego w długiej sesji traktuj poniższe akcje jak zmianę biegu, a nie jak neutralny szczegół:

| Zmiana | Co zwykle oznacza |
| --- | --- |
| Zmiana modelu | osobny cache dla nowej konfiguracji |
| Zmiana effort / reasoning | nowy wariant pracy modelu |
| Podłączenie MCP w trakcie zadania | inny zestaw narzędzi w kontekście |
| Włączenie albo wyłączenie pluginu | potencjalna zmiana tool definitions |
| `/compact` w środku debugowania | historia zostaje zastąpiona streszczeniem |
| Upgrade narzędzia kodującego | możliwa zmiana system promptu |
| Start w innym katalogu lub worktree | inny kontekst roboczy |

Nie chodzi o to, że tych rzeczy nigdy nie wolno robić. Czasem trzeba. Chodzi o moment. Jeżeli zmiana jest potrzebna, zrób krótki handoff: co robimy, jakie pliki zostały zmienione, jakie testy przeszły, co jest następnym krokiem. Potem potraktuj dalszą pracę jak nowy etap, a nie kontynuację tej samej stabilnej sesji.

## Dopisuj szum na końcu, nie na początku

Największy wróg cache'a to dynamiczne dane na początku kontekstu. Timestamp, run id, losowa notatka z harnessu, pełny log testu albo surowy output narzędzia nie powinny poprzedzać stabilnych instrukcji.

Zły układ wygląda tak:

```text
Run id: 91f...
Current time: 2026-06-24 20:14:02
Ostatnie 500 linii logu...
<reguły repozytorium>
<definicje narzędzi>
<cel zadania>
```

Lepszy układ jest odwrotny:

```text
<cel zadania>
<reguły repozytorium>
<stabilne ograniczenia>
<kryterium zakończenia>

Zmienne dane z tego uruchomienia:
- run id: 91f...
- time: 2026-06-24 20:14:02
- istotny fragment błędu: ...
```

Ta sama zasada dotyczy własnych harnessów. Sortuj narzędzia deterministycznie, nie generuj dynamicznych opisów tooli, nie wkładaj losowych metadanych do system promptu i nie przesuwaj stałych bloków tylko dlatego, że JSON akurat zwrócił inną kolejność.

## Co można robić bez paniki

Nie każda aktywność agenta psuje cache. Normalna praca w repozytorium zwykle dopisuje nowe fakty do rozmowy, ale nie musi zmieniać jej stabilnego początku. Edycja plików, uruchamianie testów, czytanie kolejnych plików, korzystanie ze skilli czy komend, a nawet spawn subagenta nie muszą same z siebie niszczyć prefiksu głównego wątku.

To rozróżnienie jest ważne. Nie chodzi o to, żeby agent bał się pracować. Chodzi o to, żeby nie przebudowywać stanowiska w trakcie każdej tury. Najpierw ustawiasz środowisko, potem pracujesz małymi krokami: czytasz, edytujesz, uruchamiasz test, poprawiasz, uruchamiasz ponownie. W tym rytmie cache ma szansę robić swoje.

## Jak poznać, że robisz to dobrze

Jeżeli korzystasz z API, patrz na metryki: `cached_tokens`, cache read/write tokens, output tokens i time to first token. Jeżeli używasz gotowego narzędzia, często nie zobaczysz pełnej telemetrii, ale nadal możesz obserwować objawy. Pierwsza tura po zmianie modelu będzie zwykle droższa lub wolniejsza. Stabilna, długa sesja powinna po rozgrzaniu działać płynniej. Kompakcja albo zmiana toolsetu może wyraźnie zmienić charakter kolejnej tury.

Gdy cache hit rate jest słaby, najpierw sprawdź początek promptu. Czy naprawdę zaczyna się od tych samych instrukcji? Czy przed nimi nie wylądował timestamp albo losowy identyfikator? Czy model, effort i narzędzia są stabilne? Czy nie kompaktujesz w połowie debugowania? Zwykle problem nie leży w samym providerze, tylko w tym, jak składamy kontekst.

## Najbardziej praktyczna wersja

Jeżeli miałbym sprowadzić to do jednej rutyny, wyglądałaby tak: zacznij od stabilnego ustawienia sesji, trzymaj reguły repozytorium w plikach, nie zmieniaj modelu ani narzędzi w środku pracy, logi i wyniki testów dopisuj na końcu, a większe zmiany konfiguracji traktuj jak nowy etap z krótkim handoffem.

Wtedy prompt caching przestaje być abstrakcyjną funkcją providera. Staje się po prostu efektem dobrego prowadzenia pracy agenta.

## Źródła

- Claude Code docs, prompt caching: <https://code.claude.com/docs/en/prompt-caching>
- OpenAI API docs, prompt caching: <https://developers.openai.com/api/docs/guides/prompt-caching>
- OpenAI, "Unrolling the Codex agent loop": <https://openai.com/index/unrolling-the-codex-agent-loop/>
- Claude API docs, prompt caching: <https://platform.claude.com/docs/en/build-with-claude/prompt-caching>
- "Don't Break the Cache: An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks": <https://arxiv.org/html/2601.06007v2>

Stan na: 2026-06-24.
