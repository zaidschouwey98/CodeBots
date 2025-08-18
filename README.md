# CodeBots
## 1. Description du projet

CodeBots est un petit jeu 2D vu de dessus en JavaScript où le joueur récolte des ressources et construit des robots programmables capables d’automatiser certaines tâches (récolte, transport, stockage, fabrication). Le jeu met l’accent sur la gestion, la programmation simple d’actions et la progression par crafting et technologies.

### Requirements fonctionnels
- Le joueur peut se déplacer et récolter des ressources (bois, pierre, etc.).
- Le joueur peut crafter des objets (outils, robots, coffres).
- Le joueur peut définir des zones et les nommer.
- Le joueur peut nommer des coffres
- Les robots peuvent recevoir des instructions (ex. séquences conditionnelles simples). Ces instructions sont directement données par le joueur.

Ex. 1
```
Repeat:
    go to zone 1
    cut wood
    go to chest 1
    drop wood to chest 1
```
Ex. 2
```
Repeat:
    go to chest 2
    pick birch seed
    go to zone 1
    plant birch seed
```
- Les ressources peuvent être stockées dans des coffres.
- Les technologies débloquées permettent d’améliorer les robots et outils.
- Une interface permet de gérer les robots et leurs actions.
- Créer un interpréteur simple permettant d'exécuter les actions du robot

### Requirements non-fonctionnels
- Jeu accessible via navigateur (client web en JS).
- Interface claire et intuitive.
- Performance fluide sur des machines standard.
- Code modulaire et extensible (facile d’ajouter de nouveaux outils/robots).
- Déploiement simple via un serveur web (hébergement Netlify).

## 2. Description préliminaire de l’architecture
- Front-end :

    - Framework : PixiJS pour le rendu 2D.

    - Langage : TypeScript

- Back-end : 
    - Authentification

    - Sauvegarde de la progression

- Organisation logique :

    - Core : moteur du jeu (entités, collisions, ressources).

    - AI/Robots : logique des robots et interprétation de leurs instructions.

    - UI : affichage HUD, inventaire, gestion des robots.

    - Persistence : sauvegarde locale ou en ligne
## 3. Mockup
## 4. Description des choix techniques

- PixiJS: librairie pour gérer le rendu 2D.

- TypeScript.

- HTML/CSS pour l’UI.

- Node.js  serveur de sauvegarde.

- GitHub pour le versioning et gestion des issues.

- CI/CD : GitHub Actions (tests + déploiement automatique).

- Déploiement : Netlify.
