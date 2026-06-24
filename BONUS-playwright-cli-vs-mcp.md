# Bonus: Playwright CLI vs Playwright MCP

Ten bonus porównuje dwa sposoby używania Playwrighta w pracy z agentami AI:

- **Playwright CLI** z repozytorium `microsoft/playwright-cli`
- **Playwright MCP** z repozytorium `microsoft/playwright-mcp`

Oba narzędzia służą do sterowania przeglądarką przez agenta, ale są zoptymalizowane pod inne style pracy. Najkrótsza praktyczna odpowiedź brzmi: **Playwright CLI lepiej pasuje do agentów kodujących, a Playwright MCP lepiej pasuje do klientów MCP i interaktywnego eksplorowania strony z poziomu narzędzi takich jak VS Code, Cursor, Windsurf czy Claude Desktop.**

## Najpierw ważne rozróżnienie

Playwright CLI w tym bonusie nie oznacza klasycznego:

```bash
npx playwright test
```

`npx playwright test` to runner testów Playwrighta. Uruchamia testy, raportuje wyniki i jest podstawowym narzędziem w projekcie testowym.

`playwright-cli` z `microsoft/playwright-cli` to osobny interfejs do sterowania przeglądarką z terminala. Agent może wykonywać polecenia typu:

```bash
playwright-cli open https://example.com
playwright-cli snapshot
playwright-cli click e15
playwright-cli fill e21 "test@example.com"
playwright-cli screenshot
playwright-cli close
```

To jest warstwa do eksploracji, debugowania i generowania wiedzy o stronie, a nie zamiennik dla testów w `@playwright/test`.

## Czym jest Playwright CLI

Playwright CLI to terminalowy interfejs do Playwrighta zaprojektowany z myślą o agentach AI. Agent nie musi dostawać dużego zestawu narzędzi MCP ani pełnej struktury strony w kontekście modelu. Wykonuje krótkie komendy, a narzędzie zapisuje bogatszy stan lokalnie, np. snapshoty, zrzuty ekranu, ślady, wideo i dane sesji.

Najważniejsze cechy:

- działa przez terminal, czyli przez mechanizm, który agenci kodujący już dobrze obsługują;
- zwraca zwięzłe wyniki i stabilne referencje elementów, np. `e15`;
- pozwala utrzymywać osobne sesje przeglądarki przez `-s=nazwa-sesji`;
- potrafi zapisywać i odtwarzać stan przeglądarki;
- wspiera akcje użytkownika, snapshoty, screenshoty, trace, video, sieć, storage i uruchamianie własnego kodu Playwrighta przez `run-code`;
- dobrze łączy się ze Skillami, czyli instrukcjami opisującymi agentowi, jak używać CLI w danym workflow.

Przykład izolowanej sesji:

```bash
playwright-cli -s=auth open https://app.example.com/login
playwright-cli -s=auth snapshot
playwright-cli -s=auth fill e1 "user@example.com"
playwright-cli -s=auth fill e2 "password"
playwright-cli -s=auth click e3
playwright-cli -s=auth state-save auth.json
playwright-cli -s=auth close
```

W projekcie takim jak ten CLI jest przydatne szczególnie przed implementacją testu: agent może wejść na stronę, sprawdzić dostępne role i teksty, zobaczyć realny flow, a potem dopiero napisać Page Object i test Playwrighta.

## Czym jest Playwright MCP

Playwright MCP to serwer Model Context Protocol. Udostępnia agentowi narzędzia do automatyzacji przeglądarki przez standard MCP. Agent komunikuje się z serwerem MCP, a serwer wykonuje akcje w Playwrightcie i zwraca strukturalne snapshoty dostępności strony.

Najważniejsze cechy:

- działa w klientach obsługujących MCP, np. VS Code, Cursor, Windsurf, Claude Desktop i innych;
- daje agentowi narzędzia do nawigacji, klikania, wpisywania tekstu, obserwowania strony i generowania testów;
- opiera interakcje na strukturalnych snapshotach dostępności, bez konieczności używania modeli wizyjnych;
- jest wygodne, gdy środowisko agenta ma natywną integrację MCP i użytkownik chce szybko podłączyć przeglądarkę jako narzędzie;
- standaryzuje sposób komunikacji między klientem AI a automatyzacją przeglądarki.

MCP jest więc bardzo dobrym wyborem, gdy pracujemy w narzędziu, które już ma sensowną obsługę MCP i chcemy dodać przeglądarkę jako kolejne narzędzie agenta.

## Porównanie praktyczne

| Kryterium | Playwright CLI | Playwright MCP |
| --- | --- | --- |
| Główny interfejs | Terminal | Serwer MCP |
| Najlepsze dopasowanie | Agenci kodujący pracujący w repozytorium | Klienci i edytory z natywną obsługą MCP |
| Koszt kontekstu modelu | Zwykle niższy, bo agent wykonuje krótkie komendy, a artefakty zostają lokalnie | Zwykle wyższy, bo klient MCP musi obsługiwać schematy narzędzi i snapshoty |
| Integracja z repo | Naturalna: komendy CLI, pliki, artefakty, testy, trace | Zależna od klienta MCP i konfiguracji serwera |
| Styl pracy | Terminal-first, dobrze pasuje do automatyzacji przez agenta | Tool-first, dobrze pasuje do interaktywnej pracy w kliencie MCP |
| Izolacja sesji | Jawne sesje przez `-s=nazwa` i profile | Zależna od konfiguracji serwera MCP i klienta |
| Artefakty | Snapshoty, screenshoty, trace, video, storage state w lokalnym workflow | Snapshoty i akcje dostępne przez protokół MCP |
| Debugowanie w repo | Łatwe do połączenia z komendami `npm`, testami i plikami projektu | Dobre do eksploracji, ale bardziej zależne od integracji narzędzia |

## Kiedy wybrać Playwright CLI

Wybierz Playwright CLI, gdy agent ma pracować jak programista w repozytorium:

- eksploruje aplikację przed napisaniem testu;
- generuje albo poprawia Page Objecty;
- uruchamia `npm run test:ui`;
- zapisuje screenshoty, trace lub snapshoty jako lokalne artefakty;
- potrzebuje izolowanych sesji, np. osobno admin, zwykły użytkownik i niezalogowany użytkownik;
- ma pracować szybko i nie marnować kontekstu modelu na duże struktury strony.

W tym repozytorium to jest domyślny kierunek dla UI testów: najpierw eksploracja strony, potem implementacja testu zgodnie z Page Object Model, selektorami `data-testid` tam, gdzie są dostępne, i strukturą given / when / then.

## Kiedy wybrać Playwright MCP

Wybierz Playwright MCP, gdy:

- pracujesz w kliencie, który dobrze obsługuje MCP;
- chcesz szybko dać agentowi narzędzie do przeglądarki bez budowania terminalowego workflow;
- zależy Ci na standardowym protokole integracji narzędzi;
- wykonujesz eksplorację strony w bardziej interaktywnym trybie;
- nie potrzebujesz tak ścisłej integracji z lokalnymi komendami repozytorium.

MCP może być wygodniejsze na starcie, szczególnie dla osób, które już mają skonfigurowany edytor z MCP i chcą po prostu dodać przeglądarkę jako narzędzie.

## Co to oznacza dla kursantów

W praktyce nie chodzi o to, że jedno narzędzie jest zawsze lepsze od drugiego. Chodzi o dopasowanie do zadania.

Jeśli celem jest **wytwarzanie testów w repozytorium**, Playwright CLI jest bardziej naturalne. Agent może użyć terminala do eksploracji strony, potem od razu edytować pliki, uruchomić nowy test, a na końcu całą paczkę UI testów.

Jeśli celem jest **podłączenie przeglądarki do agenta przez standardowy protokół narzędzi**, Playwright MCP jest bardzo dobrym wyborem. Szczególnie wtedy, gdy środowisko pracy już obsługuje MCP i cały workflow jest zbudowany wokół narzędzi MCP.

Dla tego kursu najważniejsza lekcja jest taka:

> Playwright CLI traktuj jako narzędzie robocze dla agenta kodującego. Playwright MCP traktuj jako standardową integrację przeglądarki z klientem AI.

## Proponowany workflow w tym repozytorium

1. Agent eksploruje testowaną stronę przez Playwright CLI.
2. Zbiera stabilne obserwacje: teksty, role, dostępne akcje, stany po kliknięciach.
3. Tworzy albo aktualizuje Page Object w `/pages` i ewentualne komponenty w `/components`.
4. Pisze test UI z układem given / when / then.
5. Uruchamia najpierw nowy test.
6. Uruchamia pełny zestaw:

```bash
npm run test:ui
```

7. Aktualizuje `e2e-ui-test-implementation-plan.md`, jeżeli dodał nowy pakiet testów.

To pokazuje, gdzie Playwright CLI ma największy sens: nie jako osobny gadżet, tylko jako część kompletnego cyklu pracy agenta testowego.

## Źródła

- Awesome Testing: <https://www.awesome-testing.com/2026/03/playwright-cli-skills-and-isolated-agentic-testing>
- Microsoft Playwright CLI: <https://github.com/microsoft/playwright-cli>
- Microsoft Playwright MCP: <https://github.com/microsoft/playwright-mcp>
- Dokumentacja Playwright MCP: <https://playwright.dev/docs/getting-started-mcp>

Stan na: 2026-06-24.
