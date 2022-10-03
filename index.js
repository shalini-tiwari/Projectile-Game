const canvas = document.querySelector("canvas");
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl");
const startGameBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
const bigScoreEl = document.querySelector("#bigScoreEl");

class Player {

    constructor(x, y, radius, color) {
        this.x  = x
        this.y = y

        this.radius = radius 
        this.color = color 
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill();
    }

}

class Projectile {

    constructor(x, y, radius, color, velocity){

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill();
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {

    constructor(x, y, radius, color, velocity){

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill();
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99
class Particle {

    constructor(x, y, radius, color, velocity){

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath ()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill();
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 30, '#7C3AED');
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 30, '#7C3AED');
    projectiles = []
    enemies = []
    particles = []
    score = 0;
    scoreEl.innerText = score;
    bigScoreEl.innerText = score;
}

function spawnEnemies() {
    setInterval(() => {
        
        const radius = Math.random() * (30 - 10) + 10

        // const x = Math.random() * canvas.width
        // const y = Math.random() * canvas.height
        let x, y   
        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ?  0 - radius : canvas.width + radius
            y = Math.random * canvas.height
        }
        else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ?  0 - radius : canvas.height + radius
        }

        // const color = '#EF4444'
        const color = `hsl( ${Math.random() * 360}, 50%, 50% )`;

        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
    
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}



let animationId;
let score = 0;
function animate() {

    animationId = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = 'rgba(31,41,55,0.1)'
    // c.fillStyle = 'white'
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, particleIndex) => {

        if(particle.alpha <= 0.1){
            particles.splice(particleIndex, 1)
        }else{
            particle.update();
        }
            
    })

    projectiles.forEach((projectile, projIndex) => {
        projectile.update()

        // remove from outside of screen
        if(projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ){
            projectiles.splice(projIndex, 1)
        }
    }) 

    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // end game
        if(dist - enemy.radius - player.radius  < 1) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = "flex";
            bigScoreEl.innerText = score;
        }

        projectiles.forEach((projectile, projIndex )=> {

            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // when projectiles touch enemy
            if(dist - enemy.radius - projectile.radius  < 1) {


                // increase score
                score += 100
                scoreEl.innerText = score;

                // create explosion
                for(let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random()*2 , enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 8), y: (Math.random() - 0.5) * (Math.random() * 8)}))
                }

                if(enemy.radius - 10 > 5) {
                    enemy.radius -= 10;
                }
                else{

                    score += 300
                    scoreEl.innerText = score;
    

                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projIndex, 1)
                    }, 0)
                }

                
            }

            // setTimeout(() => {

            //     // objects touch when prihectiles touch enemy
            //     if(dist - enemy.radius - projectile.radius  < 1) {
            //         enemies.splice(index, 1)
            //         projectiles.splice(projIndex, 1)
            //     }
            // }, 0)

            
        })
    })
}


addEventListener("click", (event) => {


    const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2)

    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }

    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, '#FBBF24', velocity))

})

startGameBtn.addEventListener("click", () => {
    
    init()
    
    animate();
    spawnEnemies() ;

    modalEl.style.display = "none";
})

