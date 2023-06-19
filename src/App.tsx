import React, {useEffect, useState} from 'react';
import './App.scss';

type CellState = 'onFire' | 'wall' | 'safe';

const App: React.FC = () => {
    const [gridSize, setGridSize] = useState(20);
    const [grid, setGrid] = useState<CellState[][]>([]);
    const [fireStarted, setFireStarted] = useState(false);
    const [firePropagationSpeed, setFirePropagationSpeed] = useState(500);
    const [pauseSimulation, setPauseSimulation] = useState(false);

    useEffect(() => {
        // Initialize the grid with all cells as safe
        const initialGrid: CellState[][] = Array(gridSize).fill(
            Array(gridSize).fill('safe')
        );
        setGrid(initialGrid);
    }, [gridSize]);

    const handleCellClick = (row: number, col: number, event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault(); // Empêche le menu contextuel par défaut du clic droit
        if (!fireStarted && !pauseSimulation) {
            if (event.button === 0) { // Clic gauche
                setGrid((prevGrid) => {
                    const newGrid = prevGrid.map((rowArr) => [...rowArr]);
                    newGrid[row][col] = newGrid[row][col] === 'wall' ? 'safe' : 'wall'; // Toggle the cell between wall and safe
                    return newGrid;
                });
            } else if (event.button === 2) { // Clic droit
                setGrid((prevGrid) => {
                    const newGrid = prevGrid.map((rowArr) => [...rowArr]);
                    newGrid[row][col] = 'onFire'; // Mettre le feu à la cellule cliquée
                    return newGrid;
                });
                setFireStarted(true); // Démarre la simulation du feu
            }
        }
    };


    const startFire = () => {
        if (!fireStarted) {
            setFireStarted(true);
            setGrid((prevGrid) => {
                const newGrid = prevGrid.map((row) => [...row]);
                const randomRow = Math.floor(Math.random() * gridSize);
                const randomCol = Math.floor(Math.random() * gridSize);
                newGrid[randomRow][randomCol] = 'onFire'; // Start the fire at a random cell
                return newGrid;
            });
        }
    };

    const propagateFire = () => {
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) => [...row]);

            // Propagate fire to adjacent cells
            let allCellsBurning = true; // Flag to check if all cells are burning

            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    if (prevGrid[row][col] === 'onFire') {
                        // Check neighboring cells
                        if (row > 0 && prevGrid[row - 1][col] !== 'wall' && newGrid[row - 1][col] !== 'onFire') {
                            newGrid[row - 1][col] = 'onFire'; // Top
                            allCellsBurning = false; // At least one cell is not burning
                        }
                        if (row < gridSize - 1 && prevGrid[row + 1][col] !== 'wall' && newGrid[row + 1][col] !== 'onFire') {
                            newGrid[row + 1][col] = 'onFire'; // Bottom
                            allCellsBurning = false; // At least one cell is not burning
                        }
                        if (col > 0 && prevGrid[row][col - 1] !== 'wall' && newGrid[row][col - 1] !== 'onFire') {
                            newGrid[row][col - 1] = 'onFire'; // Left
                            allCellsBurning = false; // At least one cell is not burning
                        }
                        if (col < gridSize - 1 && prevGrid[row][col + 1] !== 'wall' && newGrid[row][col + 1] !== 'onFire') {
                            newGrid[row][col + 1] = 'onFire'; // Right
                            allCellsBurning = false; // At least one cell is not burning
                        }
                    }
                }
            }

            if (allCellsBurning) {
                setFireStarted(false); // Stop the simulation when all cells are burning
            }

            return newGrid;
        });
    };

    useEffect(() => {
        if (fireStarted && !pauseSimulation) {
            // Start the simulation loop
            const intervalId = setInterval(() => {
                propagateFire();
            }, firePropagationSpeed);

            // Clean up the interval on component unmount or when the simulation is paused
            return () => {
                clearInterval(intervalId);
            };
        }
    }, [fireStarted, pauseSimulation, firePropagationSpeed]);

    const resetFire = () => {
        setFireStarted(false);
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) => [...row]);
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    if (prevGrid[row][col] === 'onFire') {
                        newGrid[row][col] = 'safe';
                    }
                }
            }
            return newGrid;
        });
    };

    const resetWalls = () => {
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) => [...row]);
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    if (prevGrid[row][col] === 'wall') {
                        newGrid[row][col] = 'safe';
                    }
                }
            }
            return newGrid;
        });
    };

    const generateRandomWalls = () => {
        resetWalls();
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) => [...row]);
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    if (Math.random() < 0.1) {
                        newGrid[row][col] = 'wall';
                    }
                }
            }
            return newGrid;
        });
    };

    const handleGridSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        if (!isNaN(newSize) && newSize > 0) {
            setGridSize(newSize);
        }
    };

    const handleFirePropagationSpeedChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newSpeed = parseInt(event.target.value, 10);
        if (!isNaN(newSpeed) && newSpeed >= 0) {
            setFirePropagationSpeed(newSpeed);
        }
    };

    return (
        <div className="fire-simulation">
            <h1>Fire propagation</h1>
            <div className="grid">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                className={`cell ${cell} ${
                                    cell === 'onFire' || cell === 'wall' ? 'on-fire' : ''
                                }`}
                                onClick={(event) => handleCellClick(rowIndex, colIndex, event)}
                                onContextMenu={(event) => handleCellClick(rowIndex, colIndex, event)}
                            >
                                {cell === 'onFire' && <img src={require('./flame-icon.png')} alt='flame'/>}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="controls">
                <div className='controls-container display-controls'>
                    <label htmlFor="gridSizeInput">Grid Size:</label>
                    <input
                        type="number"
                        id="gridSizeInput"
                        value={gridSize}
                        min="1"
                        onChange={handleGridSizeChange}
                        disabled={fireStarted}
                    /><label htmlFor="firePropagationSpeedInput">Propagation Speed:</label>
                    <input
                        type="range"
                        id="firePropagationSpeedInput"
                        value={firePropagationSpeed}
                        min="0"
                        max="1000"
                        step="100"
                        onChange={handleFirePropagationSpeedChange}
                        disabled={fireStarted || pauseSimulation}
                    />
                </div>
                <div className='controls-container simulation-controls'>
                    <button onClick={generateRandomWalls} disabled={fireStarted}>
                        Generate Random Walls
                    </button>
                    <button onClick={resetWalls}>Reset Walls</button>


                </div>
                <div className='controls-container actions-controls'>
                    <button onClick={startFire} disabled={fireStarted}>
                        Start Simulation
                        <img src={require('./flame-icon.png')} alt='flame'/>
                    </button>
                    <button onClick={resetFire}>
                        Reset Fire
                    </button>
                    <button onClick={() => setPauseSimulation(!pauseSimulation)}>
                        {pauseSimulation ? 'Resume Simulation' : 'Pause Simulation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
