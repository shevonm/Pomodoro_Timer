import React, { useState } from "react";
import useInterval from "../utils/useInterval";
import FocusDuration from "./FocusDuration";
import PlayStop from "./PlayStop";
import PomodoroDisplay from "./PomodoroDisplay";

// These functions are defined outside of the component to insure they do not have access to state
// and are, therefore more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */
function nextTick(prevState) {
  const timeRemaining = Math.max(0, prevState.timeRemaining - 1);
  // console.log('nextTick fn: ', timeRemaining)
  return {
    ...prevState,
    timeRemaining,
  };
}

/**
 * Higher order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === "Focusing") {
      return {
        label: "On Break",
        timeRemaining: breakDuration * 60,
      };
    } else {
      return {
        label: "Focusing",
        timeRemaining: focusDuration * 60,
      };
    };
    }
    
}

function Pomodoro() {
  // Timer starts out paused
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isStopDisabled, setIsStopDisabled] = useState(true)
  const [isAddMinusDisabled, setIsAddMinusDisabled] = useState(false)
  const [isDisplayed, setIsDisplayed] = useState(false)
  // The current session - null where there is no session running
  const [session, setSession] = useState(null);

  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)

  // ToDo: Allow the user to adjust the focus and break duration.
 // const focusDuration = 25;
 // const breakDuration = 5;

  /**
   * Custom hook that invokes the callback function every second
   *
   * NOTE: You will not need to make changes to the callback function
   */
  useInterval(() => {
      if (session.timeRemaining === 0) {
        new Audio("https://bigsoundbank.com/UPLOAD/mp3/1482.mp3").play();
        return setSession(nextSession(focusDuration, breakDuration));
      }
    // let newDur = focusDuration * 60
    // console.log('useInterval fn: ', newDur)
      return setSession(nextTick);
    },
    isTimerRunning ? 1000 : null
  );

  const handleMinusFocusDuration = () => { 
    if (focusDuration > 5) {
      setFocusDuration((prev) => { 
        return prev - 5
       })
    }
    
   }

  const handleAddsFocusDuration = () => {
    if (focusDuration < 60) {
      setFocusDuration((prev) => {
        return prev + 5
      })
    }
  }

  const handleMinusBreakDuration= () => {
    if (breakDuration > 1) {
      setBreakDuration((prev) => {
        return prev - 1
      })
    }

  }

  const handleAddsGreakDuration = () => {
    if (breakDuration < 15) {
      setBreakDuration((prev) => {
        return prev + 1
      })
    }
  }

  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    setIsTimerRunning((prevState) => {
      const nextState = !prevState;
      setIsStopDisabled(false)
      setIsAddMinusDisabled(true)
      setIsDisplayed(true)
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            console.log("focusDuration in playPause button:", focusDuration)
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60,
            };
          }
          console.log('prevStateSession:', prevStateSession)
          return prevStateSession;
        });
      }
      return nextState;
    });
  }

  function stopButton() {
    setIsStopDisabled(true)
    setIsAddMinusDisabled(false)
    setIsDisplayed(false)
    setFocusDuration(25)
    setBreakDuration(5)
    clearInterval();
    setIsTimerRunning((prevSet) => { 
      setSession(null)
      return false
    })
  }


  let remainingTime = (session?.timeRemaining) && (session.label === 'Focusing') ? ((((focusDuration * 60) - session?.timeRemaining) / (focusDuration * 60)) * 100) : ((session?.timeRemaining) && (session.label === 'On Break') ? ((((breakDuration * 60) - session?.timeRemaining) / (breakDuration * 60)) * 100) : 0 );
  // console.log('remainingTime: ', remainingtime)

  return (
    <div className="pomodoro">
      <FocusDuration
        focusDuration={focusDuration}
        isAddMinusDisabled={isAddMinusDisabled}
        handleMinusFocusDuration={handleMinusFocusDuration}
        handleAddsFocusDuration={handleAddsFocusDuration}
        breakDuration={breakDuration}
        handleMinusBreakDuration={handleMinusBreakDuration}
        handleAddsGreakDuration={handleAddsGreakDuration}
      />
      <PlayStop 
        playPause={playPause}
        isTimerRunning={isTimerRunning}
        isStopDisabled={isStopDisabled}
        stopButton={stopButton}
      />
      <PomodoroDisplay 
        isDisplayed={isDisplayed}
        session={session}
        focusDuration={focusDuration}
        breakDuration={breakDuration}
        remainingTime={remainingTime}
      />
    </div>
  );
}

export default Pomodoro;