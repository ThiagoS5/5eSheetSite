# 5etools data audit

MVP: level 1 character builder using 2024 rules.

| Step | 5etools files | App responsibility |
| --- | --- | --- |
| Classe | `data/class/*.json` | Classes, hit dice, proficiencies, level 1 features, starting equipment |
| Raça/Espécie | `data/races.json` | 2024 species traits, size, speed, senses, resistances, magic |
| Antecedente | `data/backgrounds.json`, `data/feats.json` | 2024 ability bonuses, Origin Feat, skills, tools, equipment |
| Atributos | `data/charcreationoptions.json`, `data/backgrounds.json` | Attribute generation methods and background ability choices |
| Equipamento | `data/items.json`, `data/class/*.json`, `data/backgrounds.json` | Equipment choices and item-derived sheet values |

2024 rule correction: species do not apply ability score bonuses. Backgrounds provide `+2/+1` or `+1/+1/+1` and the Origin Feat.
