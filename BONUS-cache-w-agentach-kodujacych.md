# Bonus: jak korzystać z cache'a w agentach kodujących

Prompt caching to mechanizm, w którym provider ponownie wykorzystuje wcześniej przetworzony początek promptu. Agent kodujący przy każdej turze wysyła dużo kontekstu: instrukcje systemowe, definicje narzędzi, reguły repozytorium, historię rozmowy, wyniki tooli i nową prośbę. Cache sprawia, że niezmieniony prefiks nie musi być liczony od zera w każdej turze. Stosuje się go po to, żeby długie sesje agentowe były tańsze i szybsze, ale efekt zależy od tego, czy pracujemy w sposób przyjazny dla cache'a.

Najważniejsza praktyczna zasada:

> Wybierz konfigurację na początku, trzymaj stabilne instrukcje wysoko w kontekście, a zmienny szum doklejaj na końcu.

Ten bonus nie jest opisem teorii prompt cachingu. To playbook do pracy z Codexem, Claude Code, własnym agentem przez API albo multi-agentowym workflowem w repozytorium.

## Co robić na początku sesji

Najdroższy błąd to zacząć chaotycznie, a potem w połowie długiej sesji zmieniać model, effort, narzędzia i zakres zadania. Claude Code docs pokazują to bardzo konkretnie: model i effort są częścią cache key, narzędzia mogą siedzieć w warstwie system promptu, a kompakcja zmienia warstwę rozmowy. OpenAI prompt caching docs mówią tę samą rzecz na niższym poziomie: cache działa na dokładnym prefiksie.

Na początku sesji ustaw:

- model;
- reasoning / effort;
- katalog roboczy;
- zestaw narzędzi i MCP;
- tryb pracy, np. plan-first albo implement-first;
- reguły repozytorium;
- kryterium zakończenia.

Potem nie ruszaj tych rzeczy bez powodu.

Dobre otwarcie zadania:

```text
Cel: dodaj test UI Playwright dla ścieżki checkout happy path.

Stały kontekst:
- użyj AGENTS.md;
- trzymaj się Page Object Model;
- preferuj data-testid;
- test ma mieć układ given / when / then;
- nowy test uruchom pierwszy, potem npm run test:ui.

Najpierw:
1. przejrzyj tylko istotne pliki;
2. zbadaj stronę Playwright CLI;
3. zwróć krótki plan;
4. nie edytuj plików przed planem.
```

To jest dobre nie tylko dlatego, że jest jasne. Jest dobre również cache'owo: stabilne reguły pojawiają się wcześnie, a zmienne wyniki eksploracji dojdą później.

## Co trzymać w stałych plikach

Nie powtarzaj w każdym promptcie tych samych instrukcji. Jeżeli reguła ma obowiązywać w repozytorium, przenieś ją do stałego miejsca.

Dobre miejsca:

- `AGENTS.md` dla zasad repozytorium;
- `README.md` dla orientacji projektowej;
- `e2e-ui-test-implementation-plan.md` dla mapy pokrycia testów;
- skille / playbooki dla powtarzalnych workflowów;
- szablony promptów dla typowych zadań.

Przykład reguł, które dobrze pasują do `AGENTS.md`:

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

To ogranicza liczbę ręcznych instrukcji w promptach i pomaga agentowi zaczynać kolejne zadania z podobnym, stabilnym kontekstem.

## Czego nie robić w środku długiej sesji

Te akcje zwykle są kosztownymi granicami. Czasem warto je wykonać, ale nie traktuj ich jako neutralnych.

| Akcja | Dlaczego boli | Lepszy moment |
| --- | --- | --- |
| Zmiana modelu | Każdy model ma osobny cache | początek sesji albo nowy etap |
| Zmiana effort / reasoning | Effort może być częścią cache key | początek sesji |
| Podłączenie MCP w trakcie pracy | Definicje tooli mogą zmienić prefiks | przed rozpoczęciem zadania |
| Włączenie/wyłączenie pluginu z MCP | Może zmienić zestaw narzędzi | nowa sesja albo naturalna przerwa |
| Deny całego toola | Zmienia to, jakie narzędzia widzi model | konfiguracja przed zadaniem |
| `/compact` w środku debugowania | Zastępuje historię streszczeniem | po zakończonym etapie |
| Upgrade narzędzia kodującego | Może zmienić system prompt i tool definitions | po zakończeniu pracy |
| Start w innym worktree/katalogu | Katalog roboczy bywa częścią kontekstu | świadoma nowa sesja |

Praktyczna zasada: jeżeli musisz zmienić model, effort albo narzędzia, zrób najpierw krótki handoff i potraktuj dalszą pracę jak nowy etap.

## Co można robić bez paniki

Claude Code docs odróżniają akcje, które psują cache, od akcji, które zwykle tylko dopisują coś na końcu rozmowy albo nie zmieniają prefiksu.

Zwykle bezpieczne dla cache'a:

- edytowanie plików w repozytorium;
- uruchamianie komend i testów;
- czytanie kolejnych plików;
- korzystanie ze skilli i komend, jeżeli są dopisywane jako wiadomości;
- zmiana permission mode;
- `/recap`, bo dopisuje podsumowanie zamiast zastępować historię;
- rewind do wcześniejszego prefiksu;
- spawn subagenta, bo subagent dostaje osobny kontekst, a główny wątek nie musi wchłaniać całego szumu.

To nie znaczy, że te akcje są darmowe. Znaczy tylko, że nie muszą rozwalić wcześniej zbudowanego prefiksu głównego wątku.

## Jak prowadzić eksplorację repozytorium

Agent kodujący często zaczyna od czytania zbyt wielu plików. To psuje jakość, puchnie kontekst i zwiększa koszt. Lepszy wzorzec to eksploracja warstwowa.

Najpierw:

```text
Przeczytaj tylko:
- AGENTS.md;
- package.json;
- istniejące testy w najbliższym katalogu;
- page objecty związane z tym flow.

Zwróć mapę 5-8 punktów i powiedz, których plików potrzebujesz dalej.
```

Potem:

```text
Teraz przeczytaj tylko pliki potrzebne do implementacji planu.
Nie skanuj całego repozytorium.
Nie wklejaj pełnych logów, tylko istotny fragment błędu.
```

W pracy z Playwrightem:

```text
Najpierw użyj Playwright CLI do eksploracji strony.
Zapisz tylko stabilne obserwacje:
- role i nazwy dostępności;
- dostępne data-testid;
- ważne stany po kliknięciach;
- URL lub route, jeśli ma znaczenie;
- brakujące selektory, jeśli trzeba poprawić aplikację.
```

To daje agentowi praktyczne dane, ale nie zalewa głównego wątku pełnym dumpem DOM, screenshotów i logów.

## Jak używać subagentów

Subagenci nie są sposobem na darmowe przyspieszenie. Codex manual jasno opisuje tradeoff: każdy subagent wykonuje własną pracę modelu i narzędzi, więc multi-agent może zużyć więcej tokenów niż pojedynczy run. Warto ich używać wtedy, gdy izolacja szumu albo równoległość naprawdę daje zysk.

Używaj subagentów do:

- read-only code review;
- analizy logów;
- porównania kilku niezależnych hipotez;
- eksploracji różnych obszarów repozytorium;
- sprawdzenia test gaps;
- security / reliability review;
- streszczenia dużego materiału do krótkiego raportu.

Nie używaj subagentów do:

- równoległej edycji tych samych plików;
- zadań, które wymagają ciągłej synchronizacji;
- naprawiania tego samego błędu przez pięć agentów naraz;
- pracy, którą główny agent zrobi w jednej krótkiej turze;
- przerzucania pełnych logów z subagentów do głównego wątku.

Dobry prompt:

```text
Uruchom trzech subagentów read-only.

Subagent 1: przejrzy ryzyka selektorów i Page Objectów.
Subagent 2: przejrzy ryzyka danych testowych i fixture'ów.
Subagent 3: przejrzy brakujące asercje i potencjalne regresje.

Każdy subagent ma zwrócić wyłącznie:
- 3-5 najważniejszych ustaleń;
- referencje do plików;
- rekomendowaną poprawkę;
- informację, czy potrzebna jest edycja kodu.

Nie edytuj plików, dopóki wszystkie raporty nie wrócą.
Nie wklejaj pełnych logów subagentów do głównego wątku.
```

Zły prompt:

```text
Uruchom 5 agentów i niech każdy spróbuje naprawić testy.
Potem połącz najlepsze zmiany.
```

Problem: dostaniesz konflikty, powielone decyzje, dużo outputu i mało kontroli.

## Jak używać kompakcji

Kompakcja ma sens, ale trzeba ją robić na granicy etapu. W Claude Code `/compact` zastępuje historię rozmowy streszczeniem. To może być dobre po zakończonej eksploracji, ale złe w środku debugowania, gdy szczegóły stack trace'a nadal są ważne.

Dobre momenty:

- eksploracja zakończona, przechodzimy do implementacji;
- implementacja zakończona, przechodzimy do review;
- review zakończone, przechodzimy do poprawek;
- zadanie zakończone, zaczynamy nowe.

Złe momenty:

- test właśnie padł i agent analizuje stack trace;
- agent porównuje dwie hipotezy;
- trzeba pamiętać szczegóły wcześniejszej decyzji;
- kompakcja jest automatyczną reakcją na "długi kontekst", bez handoffu.

Przed kompakcją każ agentowi przygotować handoff:

```text
Zanim skompaktujesz kontekst, zapisz handoff:
- cel zadania;
- zmienione pliki;
- decyzje architektoniczne;
- testy uruchomione i wyniki;
- aktualny błąd albo brak błędu;
- następny konkretny krok.

Ma to być krótkie i operacyjne, bez pełnych logów.
```

## Jak mierzyć, czy cache działa

Jeżeli używasz gotowego narzędzia, często nie zobaczysz pełnych metryk. Nadal możesz obserwować objawy: pierwsza tura po zmianie modelu jest wolniejsza, pierwsza tura po przerwie może być droższa, a po stabilnej pracy kolejne tury powinny być szybsze.

Jeżeli używasz API albo własnego harnessu, loguj:

| Metryka | Po co |
| --- | --- |
| input tokens | wielkość promptu |
| cached tokens / cache read tokens | czy prefiks faktycznie trafia w cache |
| cache write tokens | koszt budowania cache'a |
| output tokens | koszt, którego cache nie obniża |
| time to first token | efekt cache'a na latency |
| model | wykrycie przypadkowych zmian |
| reasoning / effort | wykrycie osobnych cache keys |
| hash tool definitions | wykrycie zmian w narzędziach |
| hash stable prefix | wykrycie losowego szumu na początku |

Jeżeli hit rate jest słaby, sprawdź po kolei:

1. Czy wspólny kontekst jest naprawdę na początku?
2. Czy w pierwszych liniach nie ma timestampów, run id albo losowych danych?
3. Czy model i effort są stabilne?
4. Czy narzędzia nie zmieniają kolejności ani opisu?
5. Czy nie restartujesz pracy w innym katalogu?
6. Czy nie kompaktujesz w środku zadania?
7. Czy przerwy między turami nie przekraczają TTL cache'a?

## Jak projektować własny harness

Jeżeli budujesz własnego agenta, to największy wpływ na cache masz nie w promptcie użytkownika, tylko w sposobie składania requestu.

Dobry układ requestu:

```text
1. System policy
2. Rola agenta i zasady pracy
3. Stabilne definicje narzędzi
4. Reguły repozytorium
5. Krótka mapa projektu
6. Historia rozmowy i wyniki narzędzi
7. Najnowsza prośba użytkownika
8. Zmienne dane z bieżącego uruchomienia
```

Zasady dla harnessu:

- deterministycznie sortuj narzędzia;
- nie generuj dynamicznych opisów tooli;
- nie wkładaj timestampów do system promptu;
- nie dopisuj run id przed stabilnymi instrukcjami;
- trzymaj output tooli na końcu;
- streszczaj długie logi przed dodaniem do głównego wątku;
- loguj hash stabilnego prefiksu;
- wykrywaj zmiany modelu, effort i tool schema jako osobne zdarzenia;
- jeżeli provider ma cache breakpoints, ustawiaj je na stabilnych blokach, nie na logach.

Zły wzorzec:

```text
Run id: 91f...
Current time: 2026-06-24 20:14:02
Random session note: ...
<system policy>
<tools>
<repo rules>
```

Lepszy wzorzec:

```text
<system policy>
<tools>
<repo rules>
<stable project map>

Current run:
- time: 2026-06-24 20:14:02
- run id: 91f...
```

## Gotowa checklista do pracy z agentem

Przed startem:

- wybierz model;
- wybierz effort / reasoning;
- upewnij się, że MCP i narzędzia są podłączone;
- przeczytaj `AGENTS.md`;
- zdefiniuj "done when";
- poproś o krótki plan.

W trakcie:

- nie zmieniaj modelu bez powodu;
- nie zmieniaj effort w połowie debugowania;
- nie wklejaj pełnych logów;
- uruchamiaj subagentów głównie read-only;
- streszczaj raporty subagentów;
- dopisuj zmienne dane na końcu;
- testuj w małych krokach.

Przed kompakcją:

- zapisz handoff;
- usuń z handoffu pełne logi;
- zachowaj decyzje, pliki, testy i następny krok;
- kompaktuj tylko na granicy etapu.

Po zakończeniu:

- dopisz powtarzalną lekcję do `AGENTS.md` albo playbooka;
- zaktualizuj plan testów, jeśli zadanie dotyczy pokrycia;
- nie zostawiaj wiedzy tylko w historii rozmowy.

## Gotowy blok do `AGENTS.md`

```markdown
## Agent cache discipline

- Pick the model and reasoning level at the start of a task; avoid switching mid-task unless the benefit is explicit.
- Keep durable instructions in AGENTS.md or referenced playbooks, not repeated ad hoc in every prompt.
- Put stable task context before volatile logs, diffs, timestamps, or run ids.
- Avoid connecting/disconnecting MCP servers or changing tool sets mid-task.
- Use subagents mainly for read-heavy exploration, review, log analysis, and independent summaries.
- Do not run parallel write-heavy agents against the same files unless the merge plan is explicit.
- Compact only at task boundaries and leave a short handoff before compaction.
- When available, report cached token counts or cache hit indicators in long agent runs.
```

## Krótka wersja do slajdu

Cache w agentach kodujących to dyscyplina pracy, nie przełącznik.

- Ustal model, effort i narzędzia na starcie.
- Reguły trzymaj w `AGENTS.md`, nie wklejaj ich ciągle ręcznie.
- Stabilny kontekst dawaj wysoko, logi i wyniki tooli nisko.
- Subagentów używaj do izolacji szumu, głównie read-only.
- Nie zmieniaj MCP/pluginów/modelu w środku długiego zadania.
- Kompaktuj tylko na granicach etapów.
- Mierz cache hit rate, output tokens i latency.

## Źródła

- Claude Code docs, prompt caching: <https://code.claude.com/docs/en/prompt-caching>
- OpenAI API docs, prompt caching: <https://developers.openai.com/api/docs/guides/prompt-caching>
- OpenAI, "Unrolling the Codex agent loop": <https://openai.com/index/unrolling-the-codex-agent-loop/>
- Claude API docs, prompt caching: <https://platform.claude.com/docs/en/build-with-claude/prompt-caching>
- "Don't Break the Cache: An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks": <https://arxiv.org/html/2601.06007v2>
- Codex manual, sekcje "Subagents" i "Best practices", pobrane 2026-06-24 przez OpenAI docs helper.
- Cameron Wolfe X post podany przez użytkownika: <https://x.com/cwolferesearch/status/2054202312436953270>. Bezpośrednia treść posta nie była możliwa do pobrania w tym środowisku, więc link traktuję jako inspirację tematu, nie jako źródło szczegółowych twierdzeń.

Stan na: 2026-06-24.
