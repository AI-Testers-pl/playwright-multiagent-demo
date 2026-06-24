# Bonus: Playwright CLI vs Playwright MCP

Ten bonus porównuje dwa sposoby używania Playwrighta w pracy z agentami AI:

- **Playwright CLI** z repozytorium `microsoft/playwright-cli`
- **Playwright MCP** z repozytorium `microsoft/playwright-mcp`

Na końcu pojawia się też krótka alternatywa: **Agent Browser** z ekosystemu Vercela.

Te narzędzia służą do sterowania przeglądarką przez agenta, ale są zoptymalizowane pod inne style pracy. Najkrótsza praktyczna odpowiedź brzmi: **Playwright CLI lepiej pasuje do agentów kodujących, Playwright MCP lepiej pasuje do klientów MCP, a Agent Browser jest ciekawą alternatywą CLI-first, szczególnie dla aplikacji React, Next.js i workflowów osadzonych w ekosystemie Vercela.**

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

## Alternatywa: Agent Browser od Vercela

Agent Browser to narzędzie CLI do automatyzacji przeglądarki dla agentów AI. Pod względem sposobu pracy jest bliżej Playwright CLI niż Playwright MCP, bo agent steruje przeglądarką przez komendy terminalowe, a nie przez serwer MCP.

Przykładowy styl pracy wygląda podobnie:

```bash
agent-browser open https://example.com
agent-browser snapshot
agent-browser click @e2
agent-browser fill @e3 "test@example.com"
```

Najważniejsza różnica polega na tym, że Agent Browser mocno akcentuje workflowy dla nowoczesnych aplikacji frontendowych. Według dokumentacji projektu wspiera m.in. sesje, profile, stan logowania, cookies, storage, kontrolę sieci, zrzuty ekranu, metryki Web Vitals oraz introspekcję Reacta po uruchomieniu z odpowiednią opcją.

Warto o nim wspomnieć kursantom jako o narzędziu podobnej klasy, ale nie traktowałbym go w tym repozytorium jako głównego wyboru. Ten kurs jest zbudowany wokół Playwrighta, Page Object Model i testów w `@playwright/test`, więc Playwright CLI daje bardziej bezpośrednie połączenie z resztą materiału.

## Porównanie praktyczne

| Kryterium | Playwright CLI | Playwright MCP | Agent Browser |
| --- | --- | --- | --- |
| Główny interfejs | Terminal | Serwer MCP | Terminal |
| Najlepsze dopasowanie | Agenci kodujący pracujący w repozytorium | Klienci i edytory z natywną obsługą MCP | Agenci CLI-first, szczególnie przy nowoczesnych aplikacjach frontendowych |
| Koszt kontekstu modelu | Zwykle niższy, bo agent wykonuje krótkie komendy, a artefakty zostają lokalnie | Zwykle wyższy, bo klient MCP musi obsługiwać schematy narzędzi i snapshoty | Również projektowany pod zwięzłe, agentowe interakcje |
| Integracja z repo | Naturalna: komendy CLI, pliki, artefakty, testy, trace | Zależna od klienta MCP i konfiguracji serwera | Naturalna dla pracy terminalowej, szczególnie gdy projekt korzysta z Reacta lub Next.js |
| Styl pracy | Terminal-first, dobrze pasuje do automatyzacji przez agenta | Tool-first, dobrze pasuje do interaktywnej pracy w kliencie MCP | Terminal-first, z dodatkowymi funkcjami dla Reacta, Web Vitals i kontroli sieci |
| Izolacja sesji | Jawne sesje przez `-s=nazwa` i profile | Zależna od konfiguracji serwera MCP i klienta | Sesje, profile, cookies, storage i stan logowania |
| Artefakty | Snapshoty, screenshoty, trace, video, storage state w lokalnym workflow | Snapshoty i akcje dostępne przez protokół MCP | Snapshoty, screenshoty, Web Vitals, dane sesji i narzędzia diagnostyczne |
| Debugowanie w repo | Łatwe do połączenia z komendami `npm`, testami i plikami projektu | Dobre do eksploracji, ale bardziej zależne od integracji narzędzia | Dobre do eksploracji i diagnostyki frontendowej, mniej bezpośrednio powiązane z Playwright Test |

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

Agent Browser warto znać jako trzecią opcję. Jeżeli pracujesz głównie z Reactem, Next.js albo ekosystemem Vercela, może być bardzo wygodny. Jeżeli jednak celem jest pisanie i utrzymywanie testów Playwrighta w tym repozytorium, Playwright CLI pozostaje najbardziej spójne z resztą materiału.

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

## Źródła i materiały

### Źródła podstawowe

- **Artykuł o Playwright CLI, skillach i izolowanej pracy agentów**  
  <https://www.awesome-testing.com/2026/03/playwright-cli-skills-and-isolated-agentic-testing>  
  Dobry punkt startowy do zrozumienia, dlaczego `playwright-cli` jest przydatny w pracy agentów kodujących. Szczególnie ważne są fragmenty o izolowanych sesjach, małym koszcie kontekstu i używaniu skillów jako instrukcji operacyjnych dla agenta.

- **Repozytorium Microsoft Playwright CLI**  
  <https://github.com/microsoft/playwright-cli>  
  Główne źródło dla komend CLI, przykładów użycia i aktualnego zakresu funkcji. Warto sprawdzać README, ponieważ narzędzie rozwija się niezależnie od klasycznego runnera Playwrighta.

- **Repozytorium Microsoft Playwright MCP**  
  <https://github.com/microsoft/playwright-mcp>  
  Główne źródło dla serwera MCP, konfiguracji i listy narzędzi udostępnianych agentom przez Model Context Protocol.

- **Dokumentacja Playwright MCP**  
  <https://playwright.dev/docs/getting-started-mcp>  
  Oficjalny opis uruchamiania Playwright MCP i podłączania go do klientów AI obsługujących MCP.

- **Agent Browser od Vercela**  
  <https://github.com/vercel-labs/agent-browser>  
  Alternatywne narzędzie CLI do automatyzacji przeglądarki przez agentów AI. Warto sprawdzić szczególnie przy aplikacjach React, Next.js i workflowach, w których przydatne są Web Vitals, introspekcja Reacta, profile i stan sesji.

- **Strona projektu Agent Browser**  
  <https://agent-browser.dev/>  
  Krótszy opis funkcji, instalacji i typowych przypadków użycia.

### Kontekst techniczny

- **Dokumentacja Playwrighta**  
  <https://playwright.dev/docs/intro>  
  Bazowa dokumentacja frameworka: test runner, lokatory, asercje, konfiguracja i raporty.

- **Playwright Locators**  
  <https://playwright.dev/docs/locators>  
  Przydatne tło do rozmowy o stabilnych selektorach. W tym repozytorium nadal preferujemy `data-testid`, ale warto znać też role, teksty i etykiety.

- **Playwright Test Generator**  
  <https://playwright.dev/docs/codegen>  
  Klasyczne narzędzie Playwrighta do generowania testów. Warto porównać je z podejściem agentowym: codegen nagrywa akcje, a agent powinien dodatkowo projektować Page Objecty, dane testowe i asercje.

- **Model Context Protocol**  
  <https://modelcontextprotocol.io/>  
  Ogólny kontekst dla MCP: czym jest protokół, jak klienci AI komunikują się z narzędziami i dlaczego Playwright MCP pasuje do tego ekosystemu.

### Materiały do pracy z tym repozytorium

- `PROMPT.md` - główny prompt pokazujący podział pracy na agentów.
- `main/` - punkt startowy dla kursantów.
- `wynik/` - gotowy rezultat po pracy agentów.
- `main/e2e-ui-test-implementation-plan.md` i `wynik/e2e-ui-test-implementation-plan.md` - przykłady wysokopoziomowego planu pokrycia UI testami.
- `main/pages/` i `wynik/pages/` - Page Objecty używane w testach.
- `main/tests/ui/` i `wynik/tests/ui/` - przykłady testów UI zgodnych z konwencją kursu.

### Jak korzystać z tych materiałów

1. Najpierw przeczytaj artykuł Awesome Testing i ten bonus.
2. Potem sprawdź README w `microsoft/playwright-cli` i `microsoft/playwright-mcp`.
3. Jeżeli interesują Cię alternatywy CLI-first, sprawdź `vercel-labs/agent-browser`.
4. Następnie porównaj `main/` z `wynik/`, zwracając uwagę na to, gdzie agent najpierw eksploruje aplikację, a dopiero potem pisze testy.
5. Na końcu wróć do dokumentacji Playwrighta o lokatorach i codegen, żeby zobaczyć różnicę między klasycznym generowaniem testu a agentowym workflow.

Stan na: 2026-06-24.
