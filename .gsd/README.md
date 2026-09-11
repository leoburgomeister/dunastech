# `.gsd/` — estado do projeto (metodologia GSD)

Este diretório guarda o estado vivo do ciclo GSD (`SPEC → PLAN → EXECUTE → VERIFY →
COMMIT`) para este projeto. Ele está **vazio de propósito**: os arquivos de estado da
era hackathon (26/06/2026), que descreviam Streamlit + Firebase Firestore, foram
arquivados em 2026-09-10 por descreverem um produto que não existe mais — ver
[`docs/archive/gsd-hackathon-2026-06/README.md`](../docs/archive/gsd-hackathon-2026-06/README.md).

O ciclo GSD não é o processo em uso neste repositório desde julho de 2026 (ver o aviso
no topo de `PROJECT_RULES.md`). O trabalho real de produto usa
`docs/superpowers/specs/` + `docs/superpowers/plans/`.

`templates/` e `examples/` abaixo são a ferramenta em si (genérica, não específica deste
projeto) e continuam válidos caso o ciclo GSD seja retomado — os workflows em
`.agent/workflows/` tratam a ausência de `SPEC.md` aqui como "projeto novo".
