# Playwright Multi-Agent Demo

To repozytorium pakuje demo kursowe jako porownanie w stylu monorepo:

- `main/` to projekt startowy sprzed implementacji multi-agentowej.
- `wynik/` to gotowy rezultat po zastosowaniu prompta.
- `PROMPT.md` to prompt implementacyjny w glownym katalogu repozytorium, ktory opisuje przejscie od `main/` do `wynik/`.
- `BONUS-playwright-cli-vs-mcp.md` to bonusowa notatka po polsku porownujaca Playwright CLI i Playwright MCP w workflow testow agentowych.
- `BONUS-cache-w-agentach-kodujacych.md` to bonusowa notatka po polsku o projektowaniu kontekstu, cache'u i subagentow w pracy z agentami kodujacymi.
- `slides/` zawiera deck HTML skopiowany z `~/IdeaProjects/empty2/multiagent-html-slides`.

Sugerowana kolejnosc czytania:

1. Otworz `PROMPT.md`.
2. Przeczytaj `BONUS-playwright-cli-vs-mcp.md`, jezeli chcesz dodatkowy kontekst CLI vs MCP.
3. Przeczytaj `BONUS-cache-w-agentach-kodujacych.md`, jezeli chcesz dodatkowy kontekst kosztow, cache'u i subagentow.
4. Obejrzyj punkt startowy w `main/`.
5. Porownaj go z gotowa implementacja w `wynik/`.
6. Uzyj `slides/index.html` albo `slides/multiagent-slides.pdf` podczas prezentacji workflow.

## Jak dziala demo

Prompt prosi agenta nadzorujacego o podzielenie wiekszego zadania z testami UI w Playwright na trzy rownolegle strumienie pracy subagentow:

- testy workflow LLM,
- testy zarzadzania produktami i dostepu administracyjnego,
- testy profilu oraz odzyskiwania dostepu do konta.

Kazdy subagent dostaje osobny wycinek odpowiedzialnosci: konkretne strony, page objecty i testy. Subagent eksploruje aplikacje produkcyjna przez Playwright CLI, implementuje page objecty oraz testy, a na koniec raportuje tylko zmienione pliki, uruchomione testy, wynik, ryzyka i ewentualne dotkniete pliki wspoldzielone.

Po zakonczeniu pracy subagentow agent nadzorujacy integruje calosc, robi review polaczonego wyniku, wyciaga zduplikowane helpery tam, gdzie ma to sens, sprawdza selektory, twardo wpisane dane i twardo wpisane URL-e, a na koncu uruchamia walidacje przeciwko:

```bash
APP_BASE_URL=https://aitesters.byst.re
```

## Roznica miedzy `main/` i `wynik/`

`main/` zawiera bazowy projekt Playwright: istniejace testy, fixtures, page objecty, klientow API oraz lokalne pliki skilla Playwright CLI.

`wynik/` zawiera rozszerzona implementacje wygenerowana w workflow multi-agentowym. Najwazniejsze dodatki to:

- nowe page objecty LLM i pokrycie UI w `pages/Llm*` oraz `tests/ui/llm/`,
- nowe page objecty i testy zarzadzania produktami przez admina,
- nowe page objecty i testy profilu, resetu hasla oraz odzyskiwania dostepu,
- dodatkowe wsparcie dla generowania danych, w tym generator produktow,
- aktualizacje fixtures, klienta API produktow i wysokopoziomowego planu implementacji testow UI,
- zmaterializowany katalog `.agents/skills/playwright-cli/` do eksploracji Playwright przez agenta.

W skrocie: `main/` to wejscie, `PROMPT.md` to instrukcja, a `wynik/` to rezultat.

## Uruchamianie projektu

Komendy uruchamiaj z katalogu projektu, ktory chcesz sprawdzic:

```bash
cd main
npm ci
npm run test:ui
```

albo:

```bash
cd wynik
npm ci
npm run test:ui
```

Oba katalogi sa skonfigurowane pod ten sam produkcyjny target demo przez swoje pliki projektowe.
