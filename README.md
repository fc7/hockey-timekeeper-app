# Hockey Timekeeper App

## Overview

The **Hockey Timekeeper App** is a simple web application designed to serve as a scoreboard for amateur ice or inline skater hockey games. It allows tracking game time (total running time and time remaining in period), scores, and penalties.

It is _not_ really designed for public display in a hockey venue, but rather as a tool for the timekeeper. More specifically, its primary use case is to serve as an emergency backup in case of technical issues with the official scoreboard. (See [Usage as emergency scoreboard](#usage-as-emergency-scoreboard) below.)

<!-- for a display see e.g. https://scorecount.com/ice-hockey/ -->

## Features

- Clock display that can be started and stopped (button and space bar)
- Time remaining in the period
- Score tracking
- Penalty management with total duration, player number and remaining time
- Timer for 30s timeouts
- Timer for intermissions between periods
- Supports overtime periods with customizable durations
- State is preserved in the browser's local storage

NB: There is currently no support for shootouts.

## Normal usage

- Press the space bar to start or stop the clock
- Click on the up/down arrows to increase or decrease scores for each team.
- The names of the teams are editable
- Enter a penalty by pressing the "Add penalty" button. Input the player number and the penalty duration.
- When completed, the penalty will be automatically be removed from the list.
- When a period is over, a timer for the intermission (default 5 mins) will start.
- To roll over to the next period, press "Advance period".
- When the timer is stopped, a timer for timeout can be started via the "Timeout" button.
  The countdown window will automatically close after 30s.

### Usage as emergency scoreboard

The primary goal of this app is to serve as an _emergency tool_ for timekeepers during a hockey game, in case of a technical failure of the venue's default timekeeping device.

Should this ever happen, you can quickly set the score and the timer (by separately entering the minutes and seconds on the main clock display) to reflect the current state of the running game. Each active penalty can also be entered and the remaining time can be manually set to its actual value. As soon as this is done, the timer can be started by pressing the space bar or the "Start" button.

## License

This project is provided under the terms of the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0.txt).
