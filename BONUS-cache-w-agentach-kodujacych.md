# Bonus: cache w agentach kodujących

Ten bonus wyjaśnia, jak myśleć o prompt cache'u w pracy z agentami kodującymi: Codexem, Claude Code, własnym harness'em opartym o API albo zestawem subagentów uruchamianych równolegle.

Najkrótsza praktyczna odpowiedź brzmi: **cache premiuje stabilny początek kontekstu**. Jeżeli agent przez wiele tur wysyła podobny prefiks promptu, provider może ponownie użyć wcześniej przetworzonej części. Jeżeli zmieniasz model, narzędzia, instrukcje systemowe albo strukturę promptu w środku zadania, często płacisz za ponowne przetworzenie dużej części kontekstu.

To nie jest tylko temat kosztów. To wpływa też na szybkość, sposób dzielenia pracy na subagentów i moment, w którym warto kompaktować rozmowę.

## Najpierw ważne rozróżnienie

Prompt cache nie oznacza, że model pamięta odpowiedź albo że można odzyskać wcześniejszy wynik bez liczenia nowej generacji. Cache dotyczy wejścia do modelu, najczęściej prefiksu promptu, czyli tej części, która pojawia się na początku kolejnych requestów.

W agentach kodujących ta część często zawiera:

- instrukcje systemowe i styl pracy agenta;
- definicje narzędzi;
- reguły repozytorium, np. `AGENTS.md`;
- krótką mapę projektu;
- wcześniejsze wiadomości, obserwacje i wyniki narzędzi;
- aktualną prośbę użytkownika.

Jeżeli początek kolejnego requestu jest taki sam jak wcześniej, cache może zadziałać. Jeżeli różni się na początku, model musi przetworzyć więcej rzeczy od nowa. Dlatego najważniejsza zasada brzmi:

> Stabilne rzeczy trzymaj na początku. Zmienne rzeczy doklejaj na końcu.

## Dlaczego to jest szczególnie ważne dla agentów

Zwykły chatbot często dostaje krótkie pytanie i krótką historię. Agent kodujący działa inaczej. Czyta pliki, uruchamia testy, odbiera logi, analizuje diffy, wywołuje narzędzia i prowadzi długą rozmowę z repozytorium. OpenAI w artykule o pętli Codexa opisuje, że w kolejnych turach historia rozmowy trafia do promptu, a rosnący kontekst staje się jednym z problemów, który harness musi kontrolować.

W badaniu **"Don't Break the Cache: An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks"** autorzy sprawdzali prompt caching na wieloturowych zadaniach agentowych z użyciem narzędzi. Wynik jest praktycznie istotny: cache obniżał koszt API o **41-80%** i poprawiał time to first token o **13-31%** w zależności od providera i strategii. Najważniejszy wniosek nie brzmi jednak "włącz cache i zapomnij". Najlepiej działa świadome kontrolowanie granic cache'u, np. cache'owanie stabilnego system promptu i unikanie cache'owania dynamicznych wyników narzędzi.

To dobrze pasuje do pracy w repozytorium. Reguły projektu, styl testów i struktura aplikacji są stabilne. Logi, wyniki testów i obserwacje z przeglądarki są zmienne.

## Jak działa cache u popularnych providerów

OpenAI opisuje prompt caching jako mechanizm automatyczny dla nowszych modeli. Cache działa dla promptów od określonego progu tokenów, a trafienia w cache widać w `usage.prompt_tokens_details.cached_tokens`. Dokumentacja podkreśla dokładne dopasowanie prefiksu: statyczne instrukcje i przykłady powinny być wcześniej, a zmienne dane użytkownika później.

Claude API daje większą kontrolę przez `cache_control` i cache breakpoints. Dokumentacja Anthropic opisuje 5-minutowy cache jako domyślny oraz 1-godzinny wariant za wyższy koszt zapisu. Ważny szczegół cenowy: odczyt z cache'u jest liczony jako ułamek ceny zwykłego inputu, ale zapis cache'u może być droższy niż zwykły input. To znaczy, że cache opłaca się szczególnie wtedy, gdy ten sam prefiks będzie używany więcej niż raz.

Claude Code ukrywa większość tego mechanizmu za narzędziem, ale jego dokumentacja pokazuje dokładnie ten sam model: każda tura wysyła pełny kontekst, a cache unika ponownego przetwarzania niezmienionego prefiksu. Dokumentacja wyraźnie wymienia też działania, które potrafią zepsuć cache: zmiana modelu, zmiana effort level, część zmian MCP/pluginów/narzędzi, kompakcja i upgrade narzędzia.

Gemini API ma implicit context caching dla nowszych modeli. Google również zaleca umieszczanie dużych wspólnych treści na początku promptu i wykonywanie podobnych requestów w krótkim odstępie czasu. Bedrock pokazuje z kolei wariant bardziej jawny: można ustawiać cache checkpoints w `system`, `messages` i `tools`, a limity zależą od modelu.

Wniosek praktyczny jest wspólny dla wszystkich tych środowisk:

- cache działa najlepiej na stabilnym, powtarzalnym kontekście;
- dynamiczne wyniki narzędzi są dobrym kandydatem na koniec promptu, nie na początek;
- różne modele i providery mają inne progi, TTL i metryki;
- nie warto zgadywać, trzeba mierzyć cache hit rate.

## Co cache daje, a czego nie daje

Cache pomaga w:

- obniżaniu kosztu input tokens;
- skracaniu czasu do pierwszego tokena;
- długich sesjach, w których agent pracuje iteracyjnie;
- workflowach z powtarzalnym kontekstem projektu;
- własnych harnessach, które potrafią utrzymać stabilny prefiks.

Cache nie rozwiązuje:

- kosztu output tokens;
- kosztu złych decyzji agenta;
- kosztu uruchamiania narzędzi;
- konfliktów między subagentami;
- problemu zaśmieconego kontekstu;
- potrzeby testów, review i walidacji.

To jest ważne w multi-agentach. Jeżeli uruchomisz pięciu agentów, każdy z nich nadal generuje output, wykonuje narzędzia i ma własny przebieg pracy. Cache może obniżyć część kosztu wejścia, ale nie sprawia, że równoległość jest darmowa.

## Playbook 1: zacznij sesję od stabilnego prefiksu

Pierwsze tury sesji budują kontekst, który będzie potem wracał. Dlatego nie warto zaczynać od chaotycznego dumpu logów, losowych hipotez i pełnego przeglądu repozytorium.

Dobry start zawiera:

1. cel zadania;
2. najważniejsze pliki albo katalogi;
3. reguły pracy;
4. kryterium zakończenia;
5. prośbę o krótką eksplorację przed edycją.

Przykład dla testów UI:

```text
Cel: dodaj test Playwright dla ścieżki checkout happy path.
Kontekst: użyj AGENTS.md, e2e-ui-test-implementation-plan.md, pages/, components/.
Reguły: data-testid selectors, given/when/then, Page Object Model.
Done when: najpierw przechodzi nowy test, potem npm run test:ui, a plan testów jest zaktualizowany.

Najpierw zbadaj tylko istotną stronę i istniejącą strukturę testów. Zwróć krótki plan przed edycją.
```

Taki prompt pomaga jakościowo, ale ma też sens cache'owy: stabilne reguły są na początku, a zmienne obserwacje dojdą później.

## Playbook 2: nie mieszaj stałych reguł z losowym szumem

Najczęstszy błąd w promptach do agentów to mieszanie rzeczy trwałych i jednorazowych.

Zły układ:

```text
Dzisiaj jest 2026-06-24 17:41:03. Run id: 8d1...
Oto ostatnie 500 linii logu.
Oto reguły repozytorium.
Oto definicje narzędzi.
Oto cel zadania.
```

Lepszy układ:

```text
Oto cel zadania.
Oto reguły repozytorium.
Oto stabilne ograniczenia techniczne.
Oto kryterium zakończenia.

Zmienne dane z tego uruchomienia:
- data: 2026-06-24
- run id: 8d1...
- skrót błędu: ...
```

Jeżeli budujesz własny harness, ta zasada jest jeszcze ważniejsza. Sortuj definicje narzędzi deterministycznie. Nie generuj dynamicznych opisów tooli. Nie wkładaj timestampów przed instrukcje systemowe. Nie zmieniaj kolejności dużych bloków tylko dlatego, że mapa JSON akurat zwróciła inną kolejność.

## Playbook 3: subagenci izolują hałas, ale mają własny koszt

Subagent jest świetny, gdy chcesz oddzielić hałas od głównego wątku. Może przejrzeć logi, sprawdzić ryzyka, zrobić code review albo porównać kilka obszarów kodu. Codex manual opisuje subagentów jako dobry wybór do zadań read-heavy: eksploracji, testów, triage'u i podsumowań. Jednocześnie ostrzega, że subagenci zużywają więcej tokenów niż porównywalny pojedynczy run, bo każdy robi własną pracę modelu i narzędzi.

Używaj subagentów do:

- niezależnego code review;
- analizy dużych logów;
- eksploracji kilku oddzielnych obszarów repozytorium;
- sprawdzenia hipotez bez zaśmiecania głównego wątku;
- zadań read-only, które można wykonać równolegle.

Uważaj na subagentów przy:

- edycji tych samych plików;
- zmianach architektury;
- zadaniach wymagających częstej synchronizacji;
- sytuacjach, gdzie główny agent może zrobić pracę w jednej krótkiej sesji.

Dobry prompt:

```text
Uruchom trzech subagentów read-only:
1. ryzyka selektorów i Page Objectów,
2. ryzyka danych testowych i fixture'ów,
3. brakujące asercje i regresje.

Każdy subagent ma zwrócić tylko:
- najważniejsze ustalenia z referencjami do plików,
- rekomendowaną poprawkę,
- poziom pewności,
- informację, czy potrzebna jest edycja kodu.

Nie edytuj plików, dopóki wszystkie raporty nie wrócą.
```

Największa korzyść dla głównego kontekstu polega na tym, że nie wklejasz do niego całego szumu. Wraca krótki raport, a nie kilkaset linii logów i obserwacji.

## Playbook 4: kompaktuj na granicach etapów

Kompakcja nie jest darmowym "odświeżeniem jakości". To wymiana długiej historii na streszczenie. Claude Code opisuje `/compact` jako operację, która zastępuje historię rozmowy podsumowaniem. To zmienia warstwę rozmowy, więc powinno dziać się na naturalnej granicy pracy.

Dobre momenty na kompakcję:

- po zakończonej eksploracji;
- po zakończonej implementacji;
- po review, zanim zacznie się naprawianie;
- przed przejściem do nowego niezależnego obszaru.

Złe momenty:

- w środku debugowania;
- tuż po otrzymaniu ważnego stack trace'a;
- kiedy agent nadal potrzebuje szczegółów wcześniejszej decyzji;
- automatycznie, tylko dlatego że rozmowa jest długa.

Praktyczny prompt przed kompakcją:

```text
Zanim skompaktujesz kontekst, przygotuj krótki handoff:
- aktualny cel,
- zmienione pliki,
- podjęte decyzje,
- uruchomione testy i wyniki,
- otwarte ryzyka,
- dokładny następny krok.
```

## Playbook 5: mierz cache, nie zgaduj

Jeżeli używasz API OpenAI, patrz na `cached_tokens`. Jeżeli używasz Anthropic API, obserwuj tokeny zapisu i odczytu cache'u. Jeżeli używasz Gemini, sprawdzaj pole usage metadata związane z cache hits. Jeżeli pracujesz przez gotowe narzędzie, patrz chociaż na koszt, latency i zachowanie pierwszej tury po zmianie modelu albo kompakcji.

Minimalny zestaw metryk dla własnego harnessu:

| Metryka | Po co |
| --- | --- |
| input tokens | rozmiar wejścia |
| cached tokens / cache read tokens | realny hit rate |
| cache write tokens | koszt budowania cache'u |
| output tokens | koszt, którego cache nie obniża |
| time to first token | efekt na latency |
| model i reasoning effort | porównywalność wyników |
| hash stabilnego prefiksu | wykrywanie przypadkowych zmian |
| hash definicji narzędzi | wykrywanie cache-breakerów |

Jeżeli po kilku turach `cached_tokens` nadal wynosi zero, sprawdź:

- czy prompt przekracza minimalny próg tokenów;
- czy wspólny kontekst naprawdę jest na początku;
- czy nie zmieniasz modelu albo effort level;
- czy definicje narzędzi nie zmieniają kolejności;
- czy kolejne requesty są wykonywane wystarczająco blisko siebie;
- czy provider i model obsługują dany tryb cache'u.

## Playbook 6: traktuj plany jako osobny poziom cache'u

Prompt cache dotyczy prefiksu promptu, ale w agentach istnieje jeszcze inny rodzaj oszczędności: ponowne używanie planów. OpenReview paper **"Agentic Plan Caching: Test-Time Memory for Fast and Cost-Efficient LLM Agents"** opisuje podejście, w którym system zapisuje szablony planów z wcześniejszych wykonań i adaptuje je do podobnych zadań. Autorzy raportują redukcję kosztów o około 50% i latency o około 27% przy zachowaniu większości jakości.

W pracy codziennej nie trzeba od razu budować systemu plan caching. Wystarczy praktyczna wersja:

- trzymaj sprawdzone prompt templates;
- zapisuj dobre workflowy w `AGENTS.md`, skillach albo playbookach;
- po udanej implementacji dopisz krótką checklistę;
- po powtarzającym się błędzie dopisz regułę do repozytorium;
- nie każ agentowi odkrywać od zera tego samego procesu przy każdym zadaniu.

To jest inny poziom cache'u: nie cache tokenów, tylko cache sposobu pracy.

## Typowe cache-breakery

Najczęściej cache psują:

- zmiana modelu;
- zmiana reasoning effort;
- zmiana lub przeładowanie narzędzi;
- podłączenie albo odłączenie MCP, jeżeli definicje narzędzi trafiają do prefiksu;
- zmiana pluginu, który zmienia narzędzia;
- zmiana instrukcji systemowej;
- upgrade narzędzia kodującego;
- kompakcja w środku zadania;
- restart w innym katalogu roboczym albo worktree;
- dynamiczne dane na początku promptu;
- nadmiarowe logi w głównym wątku.

Nie każda platforma zachowa się identycznie. Niektóre narzędzia odkładają definicje narzędzi poza stabilny prefiks albo używają deferred tool loading. Dlatego najlepsza reguła jest prosta: **traktuj zmianę konfiguracji agenta jako potencjalnie kosztowną granicę**.

## Proponowany workflow dla agenta kodującego

1. **Warm-up:** wybierz model i reasoning, wczytaj reguły, ustal cel.
2. **Eksploracja:** przeczytaj tylko potrzebne pliki i stronę aplikacji.
3. **Plan:** zapisz krótki plan, zanim pojawi się dużo logów.
4. **Implementacja:** pracuj w jednym wątku, dopisując wyniki testów na końcu.
5. **Subagenci:** deleguj read-only review, log analysis albo niezależne skany.
6. **Walidacja:** uruchom najpierw nowe testy, potem pełny zestaw.
7. **Handoff:** przed kompakcją zapisz decyzje, pliki, testy i następny krok.
8. **Nowy etap:** zaczynaj od krótkiego stabilnego streszczenia, nie od pełnej historii.

## Gotowy blok do `AGENTS.md`

```markdown
## Agent cache discipline

- Pick the model and reasoning level at the start of a task; avoid switching mid-task unless the benefit is explicit.
- Keep durable instructions in AGENTS.md or referenced playbooks, not repeated ad hoc in every prompt.
- Put stable task context before volatile logs, diffs, timestamps, or run ids.
- Use subagents mainly for read-heavy exploration, review, log analysis, and independent summaries.
- Do not run parallel write-heavy agents against the same files unless the merge plan is explicit.
- Compact only at task boundaries and leave a short handoff before compaction.
- When available, report cached token counts or cache hit indicators in long agent runs.
```

## Krótka wersja do slajdu

Cache premiuje stabilny prefiks.

- Model i reasoning wybierz na starcie.
- Reguły projektu trzymaj w stałym miejscu.
- Zmienny szum doklejaj na końcu.
- Subagentów używaj do izolacji, nie jako darmowego mnożnika.
- Kompaktuj na granicach etapów.
- Mierz `cached_tokens`, latency i output tokens.
- Powtarzalne workflowy zapisuj jako playbooki, skille albo reguły repozytorium.

## Źródła

- Claude Code docs: <https://code.claude.com/docs/en/prompt-caching>
- Claude API docs, prompt caching: <https://platform.claude.com/docs/en/build-with-claude/prompt-caching>
- OpenAI API docs, prompt caching: <https://developers.openai.com/api/docs/guides/prompt-caching>
- OpenAI, "Unrolling the Codex agent loop": <https://openai.com/index/unrolling-the-codex-agent-loop/>
- Google Gemini API docs, context caching: <https://ai.google.dev/gemini-api/docs/caching>
- Amazon Bedrock docs, prompt caching: <https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html>
- "Don't Break the Cache: An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks": <https://arxiv.org/html/2601.06007v2>
- "Agentic Plan Caching: Test-Time Memory for Fast and Cost-Efficient LLM Agents": <https://openreview.net/pdf?id=n4V3MSqK77>
- Codex manual, sekcje "Subagents" i "Best practices", pobrane 2026-06-24 przez OpenAI docs helper.
- Cameron Wolfe X post podany przez użytkownika: <https://x.com/cwolferesearch/status/2054202312436953270>. Bezpośrednia treść posta nie była możliwa do pobrania w tym środowisku, więc link służy jako inspiracja tematu, nie jako źródło szczegółowych twierdzeń.

Stan na: 2026-06-24.
