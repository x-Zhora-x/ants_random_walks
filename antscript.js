// Variables and constants

let paused = true;
let speed = 1; // Default speed is 1x
let addFoodMode = false;
let removeFoodMode = false;
let mouseX = 0;
let mouseY = 0;
let mouseOverCanvas = false;
let drawMode = "ant"; // Variable to keep track of the drawing mode

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let nest = { x: canvas.width / 2, y: canvas.height / 2};

// Initialize foods with two default food sources
let foods = [
    {
        x: nest.x + 200,
        y: nest.y
    },
    {
        x: nest.x - 200,
        y: nest.y
    }
];

const scentRadius = 50; // Radius of scent circle around the food
const foodRemoveRadius = 20; // Distance threshold to remove food

let antsCount = 100; // Changed from const to let
let ants = [];
const stepChange = 100;
const turnSpeed = 0.05;
let foodFound = 0; // Counter for food found and returned

// Function to initialize the ants and food sources
function initializeSimulation() {
    // Reset food sources
    foods = [
        {
            x: nest.x + 200,
            y: nest.y
        },
        {
            x: nest.x - 200,
            y: nest.y
        }
    ];

    // Reset ants
    ants = [];
    for (let i = 0; i < antsCount; i++) {
        ants.push({
            x: nest.x,
            y: nest.y,
            hasFood: false,
            direction: Math.random() * 2 * Math.PI,
            targetDirection: Math.random() * 2 * Math.PI,
            stepsLeft: stepChange
        });
    }

    // Reset counters and states
    foodFound = 0;
    paused = true;
    speed = 1;
    document.getElementById('speedSlider').value = 1;
    document.getElementById('speedValue').innerText = "1x";
    document.getElementById('pauseButton').disabled = true;
    document.getElementById('resumeButton').disabled = false;
    document.getElementById('addFoodButton').disabled = false;
    document.getElementById('removeFoodButton').disabled = false;
    document.getElementById('antCountSlider').disabled = false; // Enable ant count slider on reset
}

// Pause and resume functions
function pause() {
    if (!paused) {
        paused = true;
        speed = 0;  // Set ant speed to 0 when paused
        document.getElementById('pauseButton').disabled = true;
        document.getElementById('resumeButton').disabled = false;
        document.getElementById('addFoodButton').disabled = false;
        document.getElementById('removeFoodButton').disabled = false;
    }
}

function resume() {
    if (paused) {
        paused = false;
        speed = parseFloat(document.getElementById('speedSlider').value);  // Restore the original speed when resumed
        document.getElementById('pauseButton').disabled = false;
        document.getElementById('resumeButton').disabled = true;

        // Disable add and remove food buttons
        document.getElementById('addFoodButton').disabled = true;
        document.getElementById('removeFoodButton').disabled = true;

        if (addFoodMode) {
            addFoodMode = false;
            document.getElementById('addFoodButton').innerText = 'Add Food Mode';
        }
        if (removeFoodMode) {
            removeFoodMode = false;
            document.getElementById('removeFoodButton').innerText = 'Remove Food Mode';
        }

        document.getElementById('antCountSlider').disabled = true; // Disable ant count slider after initial start
    }
}

// Adjust speed when the slider value changes
function adjustSpeed(value) {
    speed = parseFloat(value);
    document.getElementById('speedValue').innerText = `${value}x`; // Update the display value
}

// Update ant count when the slider value changes
function updateAntCount(value) {
    antsCount = parseInt(value);
    document.getElementById('antCountValue').innerText = value;
}

// Reset the simulation to the initial state
function resetSimulation() {
    initializeSimulation();
    document.getElementById('antCountSlider').disabled = false; // Enable ant count slider on reset
}

// Toggle Add Food Mode
function toggleAddFoodMode() {
    addFoodMode = !addFoodMode;
    removeFoodMode = false; // Disable remove mode when add mode is active
    if (addFoodMode) {
        document.getElementById('addFoodButton').innerText = 'Stop Adding Food';
        document.getElementById('removeFoodButton').innerText = 'Remove Food Mode';
    } else {
        document.getElementById('addFoodButton').innerText = 'Add Food Mode';
    }
}

// Toggle Remove Food Mode
function toggleRemoveFoodMode() {
    removeFoodMode = !removeFoodMode;
    addFoodMode = false; // Disable add mode when remove mode is active
    if (removeFoodMode) {
        document.getElementById('removeFoodButton').innerText = 'Stop Removing Food';
        document.getElementById('addFoodButton').innerText = 'Add Food Mode';
    } else {
        document.getElementById('removeFoodButton').innerText = 'Remove Food Mode';
    }
}

// Set drawing mode based on user selection
function setDrawMode(mode) {
    drawMode = mode;
}

// Canvas mouse events to track cursor position
canvas.addEventListener('mousemove', function(event) {
    if (addFoodMode || removeFoodMode) {
        // Get the mouse coordinates relative to the canvas
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    }
});

canvas.addEventListener('mouseenter', function() {
    if (addFoodMode || removeFoodMode) {
        mouseOverCanvas = true;
    }
});

canvas.addEventListener('mouseleave', function() {
    if (addFoodMode || removeFoodMode) {
        mouseOverCanvas = false;
    }
});

// Canvas click event to add/remove food
canvas.addEventListener('click', function(event) {
    if (addFoodMode) {
        // Add new food source at the current mouse position
        foods.push({ x: mouseX, y: mouseY });
    }
    if (removeFoodMode) {
        // Remove the closest food source within the remove radius
        for (let i = foods.length - 1; i >= 0; i--) {
            const distToFood = Math.sqrt((mouseX - foods[i].x) ** 2 + (mouseY - foods[i].y) ** 2);
            if (distToFood < foodRemoveRadius) {
                foods.splice(i, 1); // Remove food source
                break;
            }
        }
    }
});

// Drawing function for the ant
function drawAnt(ctx, x, y, angle, color) {
    ctx.save(); // Save the current state of the canvas
        ctx.translate(x, y); // Move the canvas origin to the ant's position
    ctx.rotate(angle);   // Rotate the canvas to the ant's direction

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5; // Thinner lines for smaller ant

    // Define sizes for the ant's body parts, reduced by 3 but elongated for a longer look
    const headRadius = 1;
    const thoraxRadius = 1.3;
    const abdomenRadius = 2;
    const abdomenLength = abdomenRadius * 1.7; // Elongating the abdomen for a longer appearance
    const thoraxLength = thoraxRadius * 1.4; // Slight elongation of thorax

    // Draw the abdomen (elongated oval rear part)
    ctx.beginPath();
    ctx.ellipse(-thoraxLength - abdomenLength, 0, abdomenLength, abdomenRadius * 0.7, 0, 0, 2 * Math.PI); // Elongated oval shape for the abdomen
    ctx.fill();

    // Draw the thorax (elongated middle circle)
    ctx.beginPath();
    ctx.ellipse(0, 0, thoraxLength, thoraxRadius, 0, 0, 2 * Math.PI); // Elongating thorax slightly
    ctx.fill();

    // Draw the head (front circle)
    ctx.beginPath();
    ctx.arc(thoraxLength + headRadius, 0, headRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw antennae (two lines extending from the head)
    ctx.beginPath();
    ctx.moveTo(thoraxLength + headRadius, 0);
    ctx.lineTo(thoraxLength + headRadius + 1.7, -1.7); // Reduced by 3
    ctx.moveTo(thoraxLength + headRadius, 0);
    ctx.lineTo(thoraxLength + headRadius + 1.7, 1.7); // Reduced by 3
    ctx.stroke();

    // Draw legs (6 legs attached to the thorax)
    ctx.beginPath();

    // Hind legs (back pair)
    ctx.moveTo(-thoraxLength, 0);
    ctx.lineTo(-thoraxLength - 3.3, 2.7);  // Upper segment, reduced by 3
    ctx.moveTo(-thoraxLength - 3.3, 2.7);
    ctx.lineTo(-thoraxLength - 1.7, 5); // Lower segment, reduced by 3

    ctx.moveTo(-thoraxLength, 0);
    ctx.lineTo(-thoraxLength - 3.3, -2.7);  // Upper segment, reduced by 3
    ctx.moveTo(-thoraxLength - 3.3, -2.7);
    ctx.lineTo(-thoraxLength - 1.7, -5); // Lower segment, reduced by 3

    // Middle legs
    ctx.moveTo(0, 0);
    ctx.lineTo(-1.7, 2.7);  // Upper segment, reduced by 3
    ctx.moveTo(-1.7, 2.7);
    ctx.lineTo(-0.3, 5); // Lower segment, reduced by 3

    ctx.moveTo(0, 0);
    ctx.lineTo(-1.7, -2.7);  // Upper segment, reduced by 3
    ctx.moveTo(-1.7, -2.7);
    ctx.lineTo(-0.3, -5); // Lower segment, reduced by 3

    // Front legs
    ctx.moveTo(thoraxLength, 0);
    ctx.lineTo(thoraxLength + 2.7, 2.7);  // Upper segment, reduced by 3
    ctx.moveTo(thoraxLength + 2.7, 2.7);
    ctx.lineTo(thoraxLength + 4, 5); // Lower segment, reduced by 3

    ctx.moveTo(thoraxLength, 0);
    ctx.lineTo(thoraxLength + 2.7, -2.7);  // Upper segment, reduced by 3
    ctx.moveTo(thoraxLength + 2.7, -2.7);
    ctx.lineTo(thoraxLength + 4, -5); // Lower segment, reduced by 3

    ctx.stroke();

    // Restore the canvas state
    ctx.restore();
}

// Drawing function for the arrow (restored to original version)
function drawArrow(ctx, x, y, angle, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 12 * Math.cos(angle - Math.PI / 6), y - 12 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - 10 * Math.cos(angle), y - 10 * Math.sin(angle));
    ctx.lineTo(x - 12 * Math.cos(angle + Math.PI / 6), y - 12 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

// Main draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw nest
    ctx.fillStyle = 'brown';
    ctx.beginPath();
    ctx.arc(nest.x, nest.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw food sources and scent circles
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        // Draw food source
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(food.x, food.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw scent circle
        ctx.strokeStyle = 'rgba(0, 128, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(food.x, food.y, scentRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw the food source following the mouse cursor in "Add Food Mode"
    if (addFoodMode && mouseOverCanvas) {
        // Draw food source at mouse position
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // Semi-transparent green
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw scent circle at mouse position
        ctx.strokeStyle = 'rgba(0, 128, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, scentRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw "X" following the mouse cursor in "Remove Food Mode"
    if (removeFoodMode && mouseOverCanvas) {
        // Draw a red "X" at the mouse position to indicate removal
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mouseX - 10, mouseY - 10);
        ctx.lineTo(mouseX + 10, mouseY + 10);
        ctx.moveTo(mouseX + 10, mouseY - 10);
        ctx.lineTo(mouseX - 10, mouseY + 10);
        ctx.stroke();
    }

    // Draw food counter
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Food brought back: " + foodFound, canvas.width - 200, 30);

    for (let i = ants.length - 1; i >= 0; i--) {
        const ant = ants[i];
        if (!paused) {  // Only update when not paused
            // Find the closest food source
            let closestFood = null;
            let minDistToFood = Infinity;

            for (let j = 0; j < foods.length; j++) {
                const food = foods[j];
                let distToFood = Math.sqrt((ant.x - food.x) ** 2 + (ant.y - food.y) ** 2);
                if (distToFood < minDistToFood) {
                    minDistToFood = distToFood;
                    closestFood = food;
                }
            }

            if (ant.hasFood) {
                // Ant is returning to nest
                ant.targetDirection = Math.atan2(nest.y - ant.y, nest.x - ant.x);
                let distanceToNest = Math.sqrt((ant.x - nest.x) ** 2 + (ant.y - nest.y) ** 2);
                if (distanceToNest < 10) {
                    foodFound++;
                    ants.splice(i, 1);
                    continue;
                }
            } else if (closestFood && minDistToFood < 10) {
                // Ant has found food
                ant.hasFood = true;
                ant.targetDirection = Math.atan2(nest.y - ant.y, nest.x - ant.x);
            } else if (closestFood && minDistToFood < scentRadius) {
                // Ant is within scent radius
                ant.targetDirection = Math.atan2(closestFood.y - ant.y, closestFood.x - ant.x);

                // Gradually increase the turn speed based on proximity to food
                const proximityFactor = 1 - (minDistToFood / scentRadius); // Closer to food increases the factor
                const fastTurnSpeed = turnSpeed + (0.5 * proximityFactor); // Adjust the multiplier for speed increase

                if (Math.abs(ant.direction - ant.targetDirection) > fastTurnSpeed) {
                    if ((ant.targetDirection - ant.direction + 2 * Math.PI) % (2 * Math.PI) < Math.PI) {
                        ant.direction += fastTurnSpeed;
                    } else {
                        ant.direction -= fastTurnSpeed;
                    }
                }
           } else if (ant.stepsLeft <= 0 || Math.random() < 0.05) {
                ant.targetDirection = Math.random() * 2 * Math.PI;
                ant.stepsLeft = stepChange;
            }

            if (Math.abs(ant.direction - ant.targetDirection) > turnSpeed) {
                if ((ant.targetDirection - ant.direction + 2 * Math.PI) % (2 * Math.PI) < Math.PI) {
                    ant.direction += turnSpeed;
                } else {
                    ant.direction -= turnSpeed;
                }
            }

            ant.direction %= 2 * Math.PI;
            ant.x += Math.cos(ant.direction) * speed; // Control movement speed using the speed variable
            ant.y += Math.sin(ant.direction) * speed; // Control movement speed using the speed variable
            ant.stepsLeft--;
        }

        // Draw based on the selected drawMode
        if (drawMode === "ant") {
            drawAnt(ctx, ant.x, ant.y, ant.direction, ant.hasFood ? 'red' : 'black');
        } else if (drawMode === "arrow") {
            drawArrow(ctx, ant.x, ant.y, ant.direction, ant.hasFood ? 'red' : 'black');
        }
    }
}

// Main update loop
function update() {
    draw();
    requestAnimationFrame(update);
}

// Initialize and start the simulation when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSimulation();
    update();
});