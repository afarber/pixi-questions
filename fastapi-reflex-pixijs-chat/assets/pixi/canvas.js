// Pixi.js Canvas Setup for Phase 2
class PixiCanvas {
    constructor() {
        this.app = null;
        this.userRectangles = [];
        this.container = null;
        this.init();
    }

    async init() {
        // Create Pixi Application
        this.app = new PIXI.Application();
        await this.app.init({
            width: 800,
            height: 400,
            backgroundColor: 0x667eea,
            resizeTo: document.getElementById('pixiCanvas')
        });

        // Add canvas to DOM
        const canvasContainer = document.getElementById('pixiCanvas');
        canvasContainer.appendChild(this.app.canvas);

        // Create container for user rectangles
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        // Create placeholder user rectangles
        this.createPlaceholderUsers();

        // Start animation loop
        this.animate();

        console.log('Pixi.js canvas initialized');
    }

    createPlaceholderUsers() {
        const users = [
            { name: 'Alice', color: 0xFFB6C1, x: 150, y: 100 },
            { name: 'Bob', color: 0x98FB98, x: 400, y: 200 },
            { name: 'Charlie', color: 0xF0E68C, x: 600, y: 150 }
        ];

        users.forEach((user, index) => {
            this.createUserRectangle(user.name, user.color, user.x, user.y, index);
        });
    }

    createUserRectangle(name, color, x, y, index) {
        // Create rectangle
        const rect = new PIXI.Graphics();
        rect.rect(0, 0, 80, 40);
        rect.fill(color);
        rect.stroke({ width: 2, color: 0xFFFFFF });
        
        // Set position
        rect.x = x;
        rect.y = y;

        // Create text label
        const text = new PIXI.Text({
            text: name,
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0x000000,
                fontWeight: 'bold'
            }
        });

        // Center text on rectangle
        text.anchor.set(0.5);
        text.x = rect.width / 2;
        text.y = rect.height / 2;

        // Add text to rectangle
        rect.addChild(text);

        // Add animation properties
        rect.userData = {
            originalX: x,
            originalY: y,
            velocityX: (Math.random() - 0.5) * 2,
            velocityY: (Math.random() - 0.5) * 2,
            name: name,
            index: index
        };

        // Add to container and tracking array
        this.container.addChild(rect);
        this.userRectangles.push(rect);
    }

    animate() {
        // Animate user rectangles
        this.userRectangles.forEach(rect => {
            const userData = rect.userData;
            
            // Update position
            rect.x += userData.velocityX;
            rect.y += userData.velocityY;

            // Bounce off edges
            const bounds = this.app.screen;
            if (rect.x <= 0 || rect.x >= bounds.width - rect.width) {
                userData.velocityX *= -1;
                rect.x = Math.max(0, Math.min(bounds.width - rect.width, rect.x));
            }
            if (rect.y <= 0 || rect.y >= bounds.height - rect.height) {
                userData.velocityY *= -1;
                rect.y = Math.max(0, Math.min(bounds.height - rect.height, rect.y));
            }

            // Add subtle floating effect
            rect.x += Math.sin(Date.now() * 0.001 + userData.index) * 0.5;
            rect.y += Math.cos(Date.now() * 0.001 + userData.index) * 0.3;
        });

        // Continue animation
        requestAnimationFrame(() => this.animate());
    }

    // Method to add new user (for future phases)
    addUser(name, color) {
        const x = Math.random() * (this.app.screen.width - 80);
        const y = Math.random() * (this.app.screen.height - 40);
        this.createUserRectangle(name, color, x, y, this.userRectangles.length);
    }

    // Method to remove user (for future phases)
    removeUser(name) {
        const index = this.userRectangles.findIndex(rect => rect.userData.name === name);
        if (index !== -1) {
            this.container.removeChild(this.userRectangles[index]);
            this.userRectangles.splice(index, 1);
        }
    }
}

// Initialize canvas when DOM is loaded
let pixiCanvas;
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Pixi.js to be available
    if (typeof PIXI !== 'undefined') {
        pixiCanvas = new PixiCanvas();
    } else {
        console.error('Pixi.js not loaded');
    }
});