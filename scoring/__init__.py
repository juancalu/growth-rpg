"""scoring-core do Growth RPG (decisão registrada 2026-07-09).

Motor determinístico portado das regras canônicas (skill metodologia-guardrails,
references/tabela-validade-e-sizing.md). Increment 1: classificação por tags,
validade, sizing 1/3/8, hierarquia/de-dup e agregação (por pessoa + total de
equipe de-dup + missões de organização). Níveis/XP, vazão, camadas e emblemas
ficam para increments seguintes.

Paridade: por enquanto travada contra um fixture SINTÉTICO hand-verificado
(tests/golden/sintetico_*.json). A paridade real com o painel (FLUXO 3) exige o
input congelado de Maio + golden regenerado juntos pelo cowork — pendente.
"""

from .core import score

__all__ = ["score"]
