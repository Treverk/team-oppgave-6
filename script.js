const app = document.getElementById('app');

//Model
const model = {
    player: {
        name: 'Eskil',
        image: 'https://cdn.discordapp.com/attachments/900315139268571137/917481898069069884/eskild.png',
        totalHealth: 3000,
        crit: 1.6
    },
    enemy: {
        name: 'Boss',
        image: 'https://cdn.discordapp.com/attachments/900315139268571137/917481898501087282/file-605997c48e5b4.png',
        totalHealth: 5000
    },
    moves: {
        Chorei: { use: 10, min: 175, max: 215 },
        English: { use: 5, min: 258, max: 225 },
        Scream: { use: 5, min: 300, max: 400},
        Anger: { use: 1, min: 600, max: 900 },
        OhMyyGod: {use: 5, min: 75, max: 100 },
        Bitchii: {use: 10, min: 50, max: 100 },
        RapGod: { use: 1, min: 70, max: 1500 } 
    }
};

//View
function render(){
    app.innerHTML = `
    <div class="characters">
        <div></div>
        <div class="flex-top">
            <div class="health-bar">
                ${renderHealth(model.enemy.health, model.enemy.totalHealth)}
                <p>${model.enemy.name}</p>
                <p>${model.enemy.health < 0 ? 0 : model.enemy.health}<span class="d-light-gray-txt">/${model.enemy.totalHealth}</span></p>
            </div>
        </div>
        <img class="picture" src="${model.enemy.image}">
        <img class="picture" src="${model.player.image}">
        <div class="flex-bottom">
            <div class="health-bar">
                ${renderHealth(model.player.health, model.player.totalHealth)}
                <p>${model.player.name}</p>
                <p>${model.player.health < 0 ? 0 : model.player.health}<span class="d-light-gray-txt">/${model.player.totalHealth}</span></p>
            </div>
        </div>
        <div></div>
    </div>
    <div class="attack-text">
        <p>${model.player.lastAttack}</p>
        <p>${model.enemy.lastAttack}</p>
    </div>
    ${listMoves()}
    ${model.winner ? '<div class="winner">' + model.winner + '</div>' : ''}
    `;
}

prepareModel();

learnMoves('player', ['Chorei', 'English', 'Scream', 'Anger']);
learnMoves('enemy', ['Bitchii', 'Scream', 'OhMyyGod', 'RapGod']);

render();

//Controller
function playerMove(moveName) {
    if (model.winner) return;
    let damage = useMove('player', moveName), crit = canCrit();
    if (!damage) return;
    model.enemy.health -= Math.round(damage * (crit ? model.player.crit : 1));
    model.player.lastAttack = `${model.player.name} used ${moveName}!${crit ? ' <span class="d-green-txt">(Critical hit)</span>' : ''}`;
    if (model.enemy.health < 1) {
        model.winner = `${model.player.name} wins!`;
        render();
        return;
    }
    render();
    enemyMove();
}

function enemyMove() {
    let random = Math.floor(Math.random() * 4),
        moveName = Object.keys(model.enemy.moves)[random],
        damage = useMove('enemy', moveName);
    if (!damage) {
        model.enemy.lastAttack = `${model.enemy.name} used ${moveName}! <span class="d-red-txt">(Missed)</span>`;
        return;
    }
    model.player.health -= damage;
    model.enemy.lastAttack = `${model.enemy.name} used ${moveName}!`;
    if (model.player.health < 1) model.winner = `${model.enemy.name} wins!`;
    render();
}

// Prepares certain values in the model
function prepareModel() {
    model.winner = '';
    model.player.score = 0;
    model.player.moves = {};
    model.player.health = model.player.totalHealth;
    model.player.lastAttack = '';
    model.enemy.score = 0;
    model.enemy.moves = {};
    model.enemy.health = model.enemy.totalHealth;
    model.enemy.lastAttack = '';
}

// A check for whether playerOrEnemy is either value and if moveName is in model or not
function checkNames(playerOrEnemy, moveName) {
    return (playerOrEnemy !== 'player' && playerOrEnemy !== 'enemy') || !(moveName in model.moves);
}

// Teaches player or enemy a move
function learnMove(playerOrEnemy, moveName) {
    if (checkNames(playerOrEnemy, moveName) || Object.keys(model[playerOrEnemy].moves).length === 4) return false;
    model[playerOrEnemy].moves[moveName] = model.moves[moveName].use;
    return true;
}

// Teaches player or enemy multiple moves
function learnMoves(playerOrEnemy, moveNames) {
    for (let i = 0; i < moveNames.length; i++) {
        learnMove(playerOrEnemy, moveNames[i]);
    }
}

// Let player or enemy use a move, returning the damage
function useMove(playerOrEnemy, moveName) {
    if (checkNames(playerOrEnemy, moveName) || model[playerOrEnemy].moves[moveName] < 1) return 0;
    let diff = model.moves[moveName].max + 1 - model.moves[moveName].min,
        damage = Math.floor(Math.random() * diff) + model.moves[moveName].min;
    model[playerOrEnemy].moves[moveName]--;
    return damage;
}

// Get if it was a critical hit or not
function canCrit() {
    return Math.random() * 100 > 80;
}

// Lists available moves for player
function listMoves() {
    let keys = Object.keys(model.player.moves), html = '';
    for (let i = 0; i < 4; i++) {
        if (i < keys.length) {
            html += `<button ${model.player.moves[keys[i]] > 0 ? 'onclick="playerMove(\'' + keys[i] + '\');"' : 'disabled'}>${keys[i]} ${model.player.moves[keys[i]]}<span class="d-light-gray-txt">/${model.moves[keys[i]].use}</span></button>`;
            continue;
        }
        html += '<button disabled>Not learned</button>';
    }
    return `<div class="moves">${html}</div>`;
}

function renderHealth(currentHealth, totalHealth) {
    let percentage = Math.round(currentHealth / totalHealth * 100);
    return `<div class="health"><div style="width: ${percentage < 0 ? 0 : percentage}%;"></div></div>`;
}