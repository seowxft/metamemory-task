import React from "react";
import DrawFix from "./DrawFix";
import style from "./style/taskStyle.module.css";
import * as utils from "./utils.js";
import withRouter from "./withRouter.js";
import astrodude from "./img/astronaut.png";
import { DATABASE_URL } from "./config";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE PRE TASK (PICTURE NAMING) FOR THE TASK
// Session includes:
// 1) Introduction to cover story
// 2) NEW!! Task to name the pictures correctly

class MetaMemPreTut extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    //when deug
    //  const userID = 100;
    //  const date = 100;
    //  const startTime = 100;

    const prolificID = this.props.state.prolificID;
    const condition = this.props.state.condition;
    const userID = this.props.state.userID;
    const date = this.props.state.date;
    const startTime = this.props.state.startTime;


    const memCorrectPer = this.props.state.memCorrectPer;
    const perCorrectPer = this.props.state.perCorrectPer; //if perception task is done, it will be filled, else zero

    var statePic = this.props.state.statePic;
    var stateWord = this.props.state.stateWord;

    statePic = statePic.filter(function (val) {
      return val !== undefined;
    });

    stateWord = stateWord.filter(function (val) {
      return val !== undefined;
    });

    var stateNum = stateWord.length; //26

    var trialNumTotal = 102; // it shouldn't go past this...

    //the stim position
    var choicePos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(choicePos);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      // demo paramters
      prolificID: prolificID,
      condition: condition,
      userID: userID,
      date: date,
      startTime: startTime,
      astrodude: astrodude,

      //section paramters
      sectionTime: sectionTime,
      section: "pretutorial",

      // trial timings in ms
      fixTimeLag: 1000, //1000
      stimChoiceTimeLag: 300, //1500
      respFbTimeLag: 700, //
      fbTimeLag: 500, //500 correct or wrong

      // stimuli
      stateWord: stateWord,
      statePic: statePic,
      stateNum: stateNum,
      stimNumLeft: stateNum,

      stateWordArray: stateWord,
      statePicArray: statePic,
      choicePosList: choicePos,

      //trial parameters
      trialNumTotal: trialNumTotal,

      respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O

      //trial by trial paramters
      trialNum: 0,
      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      choicePos: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      rewFbTime: 0,
      choice: null,

      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,

      // screen parameters
      instructScreen: true,
      instructNum: 1, //start from 1
      taskScreen: false,
      taskSection: null,
      debug: false,
      
      memCorrectPer: memCorrectPer,
      perCorrectPer: perCorrectPer,
    };

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keyup", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    this.handleDebugKey = this.handleDebugKey.bind(this);
    this.handleInstruct = this.handleInstruct.bind(this);
    this.handleBegin = this.handleBegin.bind(this);
    this.handleResp = this.handleResp.bind(this);
    this.handleNextResp = this.handleNextResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.renderImages = this.renderImages.bind(this);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// KEYBOARD HANDLES ////

  handleDebugKey(pressed) {
    var whichButton = pressed;

    if (whichButton === 10) {
      document.removeEventListener("keyup", this._handleDebugKey);
      setTimeout(
        function () {
          this.redirectToTarget();
        }.bind(this),
        0
      );
    }
  }

  _handleDebugKey = (event) => {
    var pressed;

    switch (event.keyCode) {
      case 32:
        //    this is SPACEBAR
        pressed = 10;
        this.handleDebugKey(pressed);
        break;
      default:
    }
  };

  // This handles instruction screen within the component USING KEYBOARD
  handleInstruct(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 1 && curInstructNum >= 2 && curInstructNum <= 5) {
      // from page 2 to 5, I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 1 &&
      curInstructNum <= 4
    ) {
      // from page 1 to 4, I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;
    if (whichButton === 3 && curInstructNum === 5) {
      setTimeout(
        function () {
          this.preTutorBegin();
        }.bind(this),
        0
      );
    } else if (whichButton === 3 && curInstructNum === 6) {
      setTimeout(
        function () {
          this.redirectToNextTask();
        }.bind(this),
        0
      );
    }
  }

  handleResp(keyPressed, timePressed) {
    var respTime = timePressed - (this.state.trialTime + this.state.fixTime);

    var choiceCor = this.state.choiceCor; // what the actual answer is
    var choice;
    var correct;
    var response;
    if (keyPressed === 1 && choiceCor === "left") {
      choice = "left";
      response = true;
      correct = 1;
    } else if (keyPressed === 2 && choiceCor === "right") {
      choice = "right";
      response = true;
      correct = 1;
    } else if (keyPressed === 1 && choiceCor === "right") {
      choice = "left";
      response = false;
      correct = 0;
    } else if (keyPressed === 2 && choiceCor === "left") {
      choice = "right";
      response = false;
      correct = 0;
    } else {
      choice = null;
      response = false;
      correct = 0;
      console.log("No response made!");
    }

    console.log("response: " + response);
    console.log("correct: " + correct);

    this.setState({
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
    });

    setTimeout(
      function () {
        this.ifCorrect();
      }.bind(this),
      0
    );
  }

  ifCorrect() {
    var correct = this.state.correct;
    var stimShown = this.state.stimShown[0];
    var stimWordShown = this.state.stimWordShown[0];

    var stateWordArray = this.state.stateWordArray;
    var statePicArray = this.state.statePicArray;
    var stateWordArrayLeft;
    var statePicArrayLeft;

    console.log("stateWordArray: " + stateWordArray);
    console.log("stateWordArray: " + stateWordArray.length);
    //  console.log("statePicArray: " + statePicArray.length);
    //  console.log("stimShown: " + stimShown);
    console.log("stimWordShown: " + stimWordShown);

    if (correct === 1) {
      //remove the correct stimlus from the array
      stateWordArrayLeft = stateWordArray.filter(function (val) {
        return val !== stimWordShown;
      });
      statePicArrayLeft = statePicArray.filter(function (val) {
        return val !== stimShown;
      });

      console.log("CORRECT!!");
    } else {
      //if not correct, keep it in
      stateWordArrayLeft = stateWordArray;
      statePicArrayLeft = statePicArray;
      console.log("INCORRECT!!");
    }
    console.log("stateWordArrayLeft: " + stateWordArrayLeft);
    console.log("stateWordArrayLeft: " + stateWordArrayLeft.length);
    //  console.log("statePicArrayLeft: " + statePicArrayLeft.length);

    this.setState({
      stateWordArray: stateWordArrayLeft,
      statePicArray: statePicArrayLeft,
    });

    setTimeout(
      function () {
        this.renderChoiceFb();
      }.bind(this),
      0
    );
  }

  handleNextResp(keyPressed, timePressed) {
    var whichButton = keyPressed;
    if (whichButton === 3) {
      var rewFbTime =
        Math.round(performance.now()) -
        [
          this.state.trialTime +
            this.state.fixTime +
            this.state.respTime +
            this.state.respFbTime,
        ];

      this.setState({
        rewFbTime: rewFbTime,
      });

      document.removeEventListener("keyup", this._handleNextRespKey);
      setTimeout(
        function () {
          this.renderPreTutorSave();
        }.bind(this),
        0
      );
    }
  }

  // handle key keyPressed
  _handleInstructKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 37:
        //    this is left arrow
        keyPressed = 1;
        this.handleInstruct(keyPressed);
        break;
      case 39:
        //    this is right arrow
        keyPressed = 2;
        this.handleInstruct(keyPressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleBeginKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        this.handleBegin(keyPressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleRespKey = (event) => {
    var keyPressed;
    var timePressed;
    var leftKey = this.state.respKeyCode[0];
    var rightKey = this.state.respKeyCode[1];

    switch (event.keyCode) {
      case leftKey:
        //    this is left choice
        keyPressed = 1;
        timePressed = Math.round(performance.now());
        this.handleResp(keyPressed, timePressed);
        break;
      case rightKey:
        //    this is right choice
        keyPressed = 2;
        timePressed = Math.round(performance.now());
        this.handleResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleNextRespKey = (event) => {
    var keyPressed;
    var timePressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleNextResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// INSTRUCTION TEXT ////

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    let instruct_text1 = (
      <div>
        <span>
          Welcome to spaceship, engineer!
          <br /> <br />
          The ship has been damaged with an asteriod hit, and we are glad you
          are here to help.
          <br /> <br />
          We have some animals on board, and in the collision, they have
          scattered to various parts of the spaceship. We need your assistance
          in recollocating them back to their pods.
          <br /> <br />
          <center>
            Use the ← and → keys to navigate the pages.
            <br />
            <br />[<strong>→</strong>]
          </center>
        </span>
        <span className={style.astro}>
          <img src={this.state.astrodude} width={280} alt="astrodude" />
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>We have a variety of animals on board:</span>
        <br />
        <br />
        <span>
          <center>
            {this.renderImages(this.state.stateNum, this.state.statePic)}
          </center>
        </span>
        <br />
        <span>
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          As there are many animals, we will first get you familar with what
          they are called. We will show you one picture at one time. You will
          have to <strong>select the correct name</strong> of the animal that is
          shown.
        </span>
        <br />
        <br />
        <span>
          <center>
            For instance:
            <br />
            <br />
            <img
              className={style.instructStimDis}
              src={this.state.statePic[3]}
              alt="stim1"
            />
            <br />
            <br />
            <br />
            <br />
            <span className={style.choiceWordChosen}>
              {this.state.stateWord[3]}
            </span>{" "}
            <span className={style.choiceWord}>{this.state.stateWord[11]}</span>
          </center>
          <br />
          <br />
          As the animal in the picture is a {this.state.stateWord[3]}, you would
          select the <strong>left</strong> word in this case.
        </span>
        <span>
          <br />
          <br />
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text4 = (
      <div>
        <span>
          <strong>Press W</strong> to choose the word on the{" "}
          <strong>left</strong>.
          <br />
          <strong>Press O</strong> to choose the word on the{" "}
          <strong>right</strong>.
          <br />
          <br />
          If you are <strong>correct</strong>, the word that you selected will
          have its outline turn{" "}
          <font color="green">
            <strong>green</strong>
          </font>
          .
          <br />
          <br />
          If you are <strong>incorrect</strong>, the word that you selected will
          have its outline turn{" "}
          <font color="red">
            <strong>red</strong>
          </font>
          .
          <br />
          <br />
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text5 = (
      <div>
        <span>
          There are {this.state.stateNum} animals in total.
          <br />
          <br />
          This naming task will continue until{" "}
          <strong>you have selected the right name for every animal</strong>.
          <br />
          <br />
          You will be brought to the main task once you have successfully learnt
          all the names of the animals.
          <br />
          <br />
          As a reminder:
          <br />
          <br />
          <strong>Press W</strong> to choose the animal on the{" "}
          <strong>left</strong>.
          <br />
          <strong>Press O</strong> to choose the animal on the{" "}
          <strong>right</strong>.
          <br />
          <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to begin.
            <br />
            <br />[<strong>←</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text6 = (
      <div>
        <span>
          Well done! You are familar with what the animals are called.
          <br />
          <br />
          Let us move on to the main task.
          <br />
          <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to continue.
          </center>
        </span>
      </div>
    );

    switch (instructNum) {
      case 1:
        return <div>{instruct_text1}</div>;
      case 2:
        return <div>{instruct_text2}</div>;
      case 3:
        return <div>{instruct_text3}</div>;
      case 4:
        return <div>{instruct_text4}</div>;
      case 5:
        return <div>{instruct_text5}</div>;
      case 6:
        return <div>{instruct_text6}</div>;

      default:
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// TASK TOGGLES ////

  preTutorBegin() {
    // remove access to left/right/space keys for the instructions
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);

    // push to render fixation for the first trial
    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      0
    );
  }

  preTutorEnd() {
    // change state to make sure the screen is changed for the task
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 6,
      taskSection: null,
    });
  }

  preTutorFail() {
    // change state to make sure the screen is changed for the task
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 7,
      taskSection: null,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////
  // THREE COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback
  trialReset() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var choicePos = this.state.choicePosList[trialNum - 1]; //shuffle the order for the choice

    // shuffle the  list of stimuli
    var stim = this.state.statePicArray; //here i using an array that is "cut" down after every successful answer
    var stimWord = this.state.stateWordArray;
    utils.shuffleSame(stim, stimWord);

    stim = stim.filter(function (val) {
      return val !== undefined;
    });
    stimWord = stimWord.filter(function (val) {
      return val !== undefined;
    });

    var stimNumLeft = stim.length; //this should change if correct on prev trial
    console.log("trialNum: " + trialNum);
    console.log("stimNumLeft: " + stimNumLeft);

    var stimPick;
    var stimWordPick;
    var stimPickShown;
    var stimWordPickShown;
    var choicePickShown;
    var choiceWordPickShown;

    if (stimNumLeft > 1) {
      //pick the number of stim to be shown, plus 1 more for the other option of 2AFC
      //here, I cut out the last two elements in the array
      var stimPickNum = 2;
      stimPick = stim.slice([-stimPickNum]);
      stimWordPick = stimWord.slice([-stimPickNum]);

      //console.log("stimPick: " + stimPick);
      console.log("stimWordPick: " + stimWordPick);

      //this is the stim that is shown - cut the first option out
      stimPickShown = stimPick.slice(0, 1);
      stimWordPickShown = stimWordPick.slice(0, 1);

      //  utils.shuffleSame(stimPickShown, stimWordPickShown); //shuffle the order shown

      //    stimPickShown = stimPickShown.filter(function (val) {
      //      return val !== undefined;
      //    });
      //    stimWordPickShown = stimWordPickShown.filter(function (val) {
      //      return val !== undefined;
      //    });

      //this is the stim for the 2AFC - this takes the last two...stimPick is actually already length=2
      choicePickShown = stimPick.slice(-2);
      choiceWordPickShown = stimWordPick.slice(-2);
    } else if (stimNumLeft === 1) {
      //if there is only one more stimulus in the array, then...
      stimPick = stim;
      stimWordPick = stimWord;

      //this is the stim that is shown - cut the first option out (no cutting here actually since stim.length is 1)
      stimPickShown = stimPick.slice(0, 1);
      stimWordPickShown = stimWordPick.slice(0, 1);

      //this is the stim for the 2AFC - I add one pic and one word at the end for the alternative ans
      choicePickShown = stimPick.concat("bee");
      choiceWordPickShown = stimWordPick.concat("bee");

      console.log("stimPick " + stimPick);

      console.log("stimWordPickShown " + stimWordPickShown);
      console.log("choiceWordPickShown " + choiceWordPickShown);
    } else {
      //if there is NO MORE!!
      stimPick = 0;
      stimWordPick = 0;

      //this is the stim that is shown - cut the first option out (no cutting here actually since stim.length is 1)
      stimPickShown = 0;
      stimWordPickShown = 0;

      //this is the stim for the 2AFC - I add one pic and one word at the end for the alternative ans
      choicePickShown = [0, 0];
      choiceWordPickShown = [0, 0];
    }

    //    console.log("stimPickShown: " + stimPickShown);
    console.log("stimWordPickShown: " + stimWordPickShown);

    //    console.log("choicePickShown: " + choicePickShown);
    console.log("choiceWordPickShown: " + choiceWordPickShown);

    // have to do shuffling of the answers
    var choiceShownWordLeft;
    var choiceShownWordRight;
    var choiceCor;
    if (choicePos === 1) {
      choiceShownWordLeft = choiceWordPickShown[0];
      choiceShownWordRight = choiceWordPickShown[1];
      choiceCor = "left";
    } else {
      choiceShownWordLeft = choiceWordPickShown[1];
      choiceShownWordRight = choiceWordPickShown[0];
      choiceCor = "right";
    }

    //Reset all parameters
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "iti",
      trialNum: trialNum,
      stimNumLeft: stimNumLeft,
      fixTime: 0,
      stimTime: 0,

      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      rewFbTime: 0,

      choice: null,
      correct: null,
      correctPer: null,
      choiceCor: choiceCor,
      choicePos: choicePos,

      stimPick: stimPick,
      stimWordPick: stimWordPick,
      stimShown: stimPickShown,
      stimWordShown: stimWordPickShown,
      choiceShownWordLeft: choiceShownWordLeft,
      choiceShownWordRight: choiceShownWordRight,

      choiceFbLeft: style.choiceWord,
      choiceFbRight: style.choiceWord,
      choiceFbRewLeft: style.choiceWord,
      choiceFbRewRight: style.choiceWord,
    });

    //  console.log("trialNum: " + this.state.trialNum);
    //  console.log("stimNumLeft: " + this.state.stimNumLeft);

    if (stimNumLeft >= 1) {
      setTimeout(
        function () {
          this.renderFix();
        }.bind(this),
        0
      );
    } else if (stimNumLeft === 0) {
      // if the trials have finished all the picutres below 100 trials
      setTimeout(
        function () {
          this.preTutorEnd();
        }.bind(this),
        0
      );
    }
  }

  renderFix() {
    var trialTime = Math.round(performance.now());

    //Show fixation
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "fixation",
      trialTime: trialTime,
    });

    setTimeout(
      function () {
        this.renderStimChoice();
      }.bind(this),
      this.state.fixTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStimChoice() {
    document.addEventListener("keyup", this._handleRespKey);
    var fixTime = Math.round(performance.now()) - this.state.trialTime;

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "stimChoice",
      fixTime: fixTime,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoiceFb() {
    document.removeEventListener("keyup", this._handleRespKey);

    var choice = this.state.choice;
    var choiceFbLeft;
    var choiceFbRight;

    if (choice === "left") {
      choiceFbLeft = style.choiceWordChosen;
      choiceFbRight = style.choiceWord;
    } else if (choice === "right") {
      choiceFbLeft = style.choiceWord;
      choiceFbRight = style.choiceWordChosen;
    } else {
      choiceFbLeft = style.choiceWord;
      choiceFbRight = style.choiceWord;
    }

    //  console.log("choice: " + choice);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choiceFeedback",
      choiceFbLeft: choiceFbLeft,
      choiceFbRight: choiceFbRight,
    });

    setTimeout(
      function () {
        this.renderCorFb();
      }.bind(this),
      this.state.respFbTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderCorFb() {
    document.addEventListener("keyup", this._handleNextRespKey);

    var respFbTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime + this.state.respTime];

    var choice = this.state.choice;
    var correct = this.state.correct;
    var choiceFbRewLeft;
    var choiceFbRewRight;
    var choiceFbRewText;

    //    console.log("choice: " + choice);
    //  console.log("correct: " + correct);

    if (choice === "left" && correct === 1) {
      choiceFbRewLeft = style.choiceWordCorrect;
      choiceFbRewRight = style.choiceWord;
      choiceFbRewText = "Correct!";
    } else if (choice === "left" && correct === 0) {
      choiceFbRewLeft = style.choiceWordWrong;
      choiceFbRewRight = style.choiceWord;
      choiceFbRewText = "Incorrect!";
    } else if (choice === "right" && correct === 1) {
      choiceFbRewLeft = style.choiceWord;
      choiceFbRewRight = style.choiceWordCorrect;
      choiceFbRewText = "Correct!";
    } else if (choice === "right" && correct === 0) {
      choiceFbRewLeft = style.choiceWord;
      choiceFbRewRight = style.choiceWordWrong;
      choiceFbRewText = "Incorrect!";
    } else {
      choiceFbRewLeft = style.choiceWord;
      choiceFbRewRight = style.choiceWord;
      choiceFbRewText = "No Answer?";
    }

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "corFeedback",
      respFbTime: respFbTime,
      choiceFbRewLeft: choiceFbRewLeft,
      choiceFbRewRight: choiceFbRewRight,
      choiceFbRewText: choiceFbRewText,
    });
  }

  renderPreTutorSave() {
    var prolificID = this.state.prolificID;

    //  var stimPickShown = this.state.stimPickShown.substring(0, 50);
    //  var statePicArray = this.state.statePicArray.substring(0, 50);

    var stimShown = null;
    var stimPick = null;
    var statePicArray = null;

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      trialNum: this.state.trialNum,
      stimNumLeft: this.state.stimNumLeft,
      choiceCor: this.state.choiceCor,
      choicePos: this.state.choicePos,

      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      respTime: this.state.respTime,
      respFbTime: this.state.respFbTime,
      rewFbTime: this.state.rewFbTime,
      responseKey: this.state.responseKey,
      choice: this.state.choice,
      correct: this.state.correct,

      statePicArray: statePicArray,
      stateWordArray: this.state.stateWordArray,

      stimPick: stimPick,
      stimWordPick: this.state.stimWordPick,
      stimShown: stimShown,
      stimWordShown: this.state.stimWordShown,
      choiceShownWordLeft: this.state.choiceShownWordLeft,
      choiceShownWordRight: this.state.choiceShownWordRight,
    };

    console.log(saveString);

    try {
      fetch(`${DATABASE_URL}/mem_pre_tutorial_data/` + userID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveString),
      });
    } catch (e) {
      console.log("Cant post?");
    }

    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      10
    );
  }

  redirectToNextTask() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    this.props.navigate("/MetaMemTut?PROLIFIC_PID=" + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        condition: this.state.condition,
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        statePic: this.state.statePic,
        stateWord: this.state.stateWord,
        perCorrectPer: this.state.perCorrectPer,
        memCorrectPer: this.state.memCorrectPer,
      },
    });

    console.log("UserID is: " + this.state.userID);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
  }

  renderImages(number, imageArray) {
    const imageElements = [];
    for (let i = 0; i < number; i++) {
      const imageSrc = imageArray[i];
      imageElements.push(
        <img key={i} className={style.instructStimDis} src={imageSrc} alt="" />
      );
    }
    return imageElements;
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.debug === false) {
      if (
        this.state.instructScreen === true &&
        this.state.taskScreen === false
      ) {
        document.addEventListener("keyup", this._handleInstructKey);
        document.addEventListener("keyup", this._handleBeginKey);
        text = <div> {this.instructText(this.state.instructNum)}</div>;
        //  console.log("THIS SHOULD BE INSTRUCTION BLOCK");
        //  console.log("instructNum: " + this.state.instructNum);
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "iti"
      ) {
        text = <div className={style.boxStyle}></div>;
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "fixation"
      ) {
        text = (
          <div className={style.boxStyle2}>
            <br />
            <br />

            <center>
              <img
                className={style.stimDisHide}
                src={this.state.stimShown}
                alt="stim1"
              />{" "}
            </center>
            <DrawFix />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "stimChoice"
      ) {
        text = (
          <div className={style.boxStyle2}>
            <center>What animal is this?</center>
            <br />
            <br />
            <center>
              <img
                className={style.instructStimDis}
                src={this.state.stimShown}
                alt="stim1"
              />{" "}
            </center>
            <br />
            <br />
            <br />
            <br />
            <span className={style.choiceWord}>
              {this.state.choiceShownWordLeft}
            </span>
            &nbsp;or&nbsp;
            <span className={style.choiceWord}>
              {this.state.choiceShownWordRight}
            </span>
            <br />
            <br />
            <br />
            <br />
            <center> </center>
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "choiceFeedback"
      ) {
        text = (
          <div className={style.boxStyle2}>
            <center>What animal is this?</center>
            <br />
            <br />
            <center>
              <img
                className={style.instructStimDis}
                src={this.state.stimShown}
                alt="stim1"
              />{" "}
            </center>
            <br />
            <br />
            <br />
            <br />
            <span className={this.state.choiceFbLeft}>
              {this.state.choiceShownWordLeft}
            </span>
            &nbsp;or&nbsp;
            <span className={this.state.choiceFbRight}>
              {this.state.choiceShownWordRight}
            </span>
            <br />
            <br />
            <br />
            <br />
            <center> </center>
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "corFeedback"
      ) {
        text = (
          <div className={style.boxStyle2}>
            <center>{this.state.choiceFbRewText}</center>
            <br />
            <br />
            <center>
              <img
                className={style.instructStimDis}
                src={this.state.stimShown}
                alt="stim1"
              />{" "}
            </center>
            <br />
            <br />
            <br />
            <br />
            <span className={this.state.choiceFbRewLeft}>
              {this.state.choiceShownWordLeft}
            </span>
            &nbsp;or&nbsp;
            <span className={this.state.choiceFbRewRight}>
              {this.state.choiceShownWordRight}
            </span>
            <br />
            <br />
            <br />
            <br />
            <center>Press the [SPACEBAR] to continue.</center>
          </div>
        );
      }
    } else if (this.state.debug === true) {
      document.addEventListener("keyup", this._handleDebugKey);
      text = (
        <div>
          <p>
            <span>DEBUG MODE</span>
            <br />
            <span>
              Press [<strong>SPACEBAR</strong>] to skip to next section.
            </span>
          </p>
        </div>
      );
    }

    return (
      <div className={style.bg}>
        <div className={style.textFrame}>
          <div className={style.fontStyle}>{text}</div>
        </div>
      </div>
    );
  }
}

export default withRouter(MetaMemPreTut);
