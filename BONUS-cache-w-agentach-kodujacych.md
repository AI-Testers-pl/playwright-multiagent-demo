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

## Źródła

- Claude Code docs, prompt caching: <https://code.claude.com/docs/en/prompt-caching>
- OpenAI API docs, prompt caching: <https://developers.openai.com/api/docs/guides/prompt-caching>
- OpenAI, "Unrolling the Codex agent loop": <https://openai.com/index/unrolling-the-codex-agent-loop/>
- Claude API docs, prompt caching: <https://platform.claude.com/docs/en/build-with-claude/prompt-caching>
- "Don't Break the Cache: An Evaluation of Prompt Caching for Long-Horizon Agentic Tasks": <https://arxiv.org/html/2601.06007v2>

Stan na: 2026-06-24.
