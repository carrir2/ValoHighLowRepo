import React, { useState, useEffect } from 'react';
import './HigherOrLowerGame.css';
import jsonData from './testdataAmericas.json';


const statSel = ["acs", "kd", "adr", "kpr", "kmax", "kills", "deaths", "assists"];

const HigherOrLowerGame = () => {
    const [currentNumber, setCurrentNumber] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [nextNumber, setNextNumber] = useState(0);
    const [nextPlayer, setNextPlayer] = useState(0);
    const [stat, setStat] = useState('');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [message, setMessage] = useState('');
    const [recent] = useState([]);
    const [isTextVisible, setIsTextVisible] = useState(false);
    const name = jsonData.name;
    const [color, setColor] = useState("#40474F");


    useEffect(() => {
        console.log(jsonData.stats[0]['kills']);
        startGame();
        const savedHighScore = localStorage.getItem('highScore');
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10));
        }
    }, []);


    const startGame = () => {
        if (name.includes("Americas")){
            setColor("#FF570C");
        } else if (name.includes("Pacific")){
            setColor("#01D2D7");
        } else if (name.includes("EMEA")){
            setColor("#D5FF1D");
        } else if (name.includes("China")){
            setColor("#E73056");
        } else if (name.includes("Masters")){
            setColor("#9464F6");
        } else{
            setColor("#C6B275");
        }

        const selectedStat = statSel[Math.floor(Math.random() * statSel.length)];
        setStat(selectedStat);

        const player = Math.floor(Math.random() * jsonData.stats.length);
        recent.push(player);
        setCurrentPlayer(player);
        setCurrentNumber(jsonData.stats[player][selectedStat]);
        generateNextNumber(selectedStat, player);
    };

    const generateNextNumber = (selectedStat, currentPlayer) => {
        console.log("-----------------");
        for (const element of recent) {
            console.log(jsonData.stats[element]["username"]);
          }

        let nextPlayer;
        do {
            nextPlayer = Math.floor(Math.random() * jsonData.stats.length);
        } while (currentPlayer === nextPlayer || recent.includes(nextPlayer) || jsonData.stats[nextPlayer][selectedStat]===null);
        
        if (recent.length > Math.floor(jsonData.stats.length*.1)){
            recent.shift();
        }
        recent.push(nextPlayer);
        setNextPlayer(nextPlayer);
        setNextNumber(jsonData.stats[nextPlayer][selectedStat]);
        console.log(jsonData.stats[nextPlayer][selectedStat])

    };

    const revealClick = (guess) => {
        let upScore = score;
        setIsTextVisible(true);
        if ((guess === 'higher' && nextNumber > currentNumber) ||
            (guess === 'lower' && nextNumber < currentNumber)||
            (nextNumber === currentNumber))  {
            setScore(score + 1);
            upScore+=1;
            if (upScore > highScore){
                setHighScore(score+1);
                localStorage.setItem('highScore', score+1);
            }
            setMessage('Correct');
        } else {
            setMessage('Wrong');
            setScore(0);
        }
        
        setTimeout(() => {
            handleGuess(upScore)
            setIsTextVisible(false);
        }, 3000);
    }

    const handleGuess = (upScore) => {
        let selectedStat = stat, nextN = nextNumber;

        console.log(selectedStat);
        console.log(upScore);
        if ((upScore) % 5===0 && upScore !==0){
            do{
                selectedStat = statSel[Math.floor(Math.random() * statSel.length)];
                
            } while (selectedStat === stat);
            setStat(selectedStat);
            nextN = jsonData.stats[nextPlayer][selectedStat];
            console.log(selectedStat+"--- "+stat);
        }
        setCurrentPlayer(nextPlayer)
        setCurrentNumber(nextN);
        generateNextNumber(selectedStat, nextPlayer);

    };

    return (
        <div>

            <div className="split left">
            <div className="centered">
                <img src={jsonData.stats[currentPlayer]['image']} alt="current" style={{border: '5px solid'+ color}}></img>
                <h2>{jsonData.stats[currentPlayer]['team']} {jsonData.stats[currentPlayer]['username']}</h2>
                <h3>has</h3>
                <p className="numDisplay">{currentNumber} {stat.toUpperCase()}</p>
            </div>
            </div>

            <div className="split right" style={{backgroundColor: color}}>
            <div className="centered">
            <img src={jsonData.stats[nextPlayer]['image']} alt="next"></img>
                <h2>{jsonData.stats[nextPlayer]['team']} {jsonData.stats[nextPlayer]['username']}</h2>
                <h3>has</h3>
                
                {isTextVisible ? (
                    <div>
                        <p className="numDisplay">{nextNumber} {stat.toUpperCase()}</p>
                    </div>
                
                
                ) : (
                    <div>
                        <div className="button-container">
                            <button onClick={() => revealClick('higher')}>Higher ▲</button><br></br>
                            <button onClick={() => revealClick('lower')}>Lower ▼</button>
                        </div>
                        <p style={{fontSize: 30}}>{stat.toUpperCase()} than {jsonData.stats[currentPlayer]['username']}</p>
                    </div>
                )}


                
            </div>
                <div className="bottomright">
                    Score: {score} <br></br>
                    High Score: {highScore}
                </div>
            
            </div>
            <div className ="footer">
                <img src={'/logo.png'} alt="higherlower" className="logo"/>
                <img src={jsonData.logo} alt="tourney logo" className="tourney"/>              
                <h3>{jsonData.name}</h3>
            </div>


            <div className="centerContainer" style={{backgroundColor: '#D8D8D8', display: !isTextVisible ? 'block' : 'none'}}>
                <img src={'/versus.png'} alt="vs"/>
            </div>
            

            <div className="centerContainer" style={{backgroundColor: '#1AEA6F', display: isTextVisible && message==='Correct' ? 'block' : 'none'}} display>
                <img src={'/crct.png'} alt="vs"/>
            </div>
            
            
            <div className="centerContainer" style={{backgroundColor: '#E88282', display: isTextVisible && message==='Wrong' ? 'block' : 'none'}} >
                <img src={'/x.png'} alt="vs"/>
            </div>
            
        </div>


        

    );
};


{/* <div className="game-container">
            <h1>Higher or Lower Game</h1>
            <h2>{stat}</h2>
            <p>{jsonData.stats[currentPlayer]['username']}: {currentNumber}</p>
            <div className="button-container">
                <button onClick={() => handleGuess('higher')}>Higher</button>
                <button onClick={() => handleGuess('lower')}>Lower</button>
            </div>
            <p>{jsonData.stats[nextPlayer]['username']}: {nextNumber}</p>
            <p>Score: {score}</p>
            <p>{message}</p>
        </div> */}
export default HigherOrLowerGame;