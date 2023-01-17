import React from "react";
import DrawFix from "./DrawFix";
import style from "./style/taskStyle.module.css";
import * as utils from "./utils.js";
import * as staircase from "./staircase.js";
import withRouter from "./withRouter.js";
import * as ConfSlider from "./DrawConfSlider.js";
import * as ConfSliderGlobal from "./DrawConfSliderGlobal.js";

//import { DATABASE_URL } from "./config";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TASK SESSION
// 1) Pre task confidence ratings
// 2) Task with trial by trial conf ratings

class MetaMemTask extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    //when deug
    //  const userID = 100;
    //  const date = 100;
    //  const startTime = 100;
    //
    const userID = this.props.state.userID;
    const date = this.props.state.date;
    const startTime = this.props.state.startTime;
    const stimNum = this.props.state.stimNum;

    const statePic = this.props.state.statePic;
    const stateWord = this.props.state.stateWord;

    var trialNumTotal = 30; //150
    var blockNumTotal = 3;
    var trialNumPerBlock = Math.round(trialNumTotal / blockNumTotal);

    //the choice position
    var choicePos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(choicePos);

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      userID: userID,
      date: date,
      startTime: startTime,
      section: "task",
      sectionTime: sectionTime,

      // trial timings in ms
      fixTimeLag: 1000, //1000
      stimTimeLag: 1500, //1500
      encodeTimeLag: 1000,
      respFbTimeLag: 700,

      //trial parameters
      trialNumTotal: trialNumTotal,
      trialNumPerBlock: trialNumPerBlock,
      blockNumTotal: blockNumTotal,
      choicePosList: choicePos,
      respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O

      // stimuli
      stateWord: stateWord,
      statePic: statePic,

      //trial by trial paramters
      blockNum: 1,
      trialNum: 0,
      trialNumInBlock: 0,
      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      choicePos: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      choice: null,
      confLevel: null,
      confTime: 0,
      confInitial: null,
      //    confMove: null, //can only move to next trial if conf was toggled
      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,

      // staircase parameters
      responseMatrix: [true, true],
      reversals: 0,
      stairDir: ["up", "up"],
      stimNum: stimNum,

      //quiz
      quizState: "pre",

      // screen parameters
      instructScreen: true,
      instructNum: 1,
      quizScreen: false,
      taskScreen: false,
      taskSection: null,
      debug: false,
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
    this.handleConfResp = this.handleConfResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.quizText = this.quizText.bind(this);
    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }

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

    if (whichButton === 1 && curInstructNum === 2) {
      // from page 2 , I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (whichButton === 2 && curInstructNum === 1) {
      // from page 1 , I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;
    if (whichButton === 3 && curInstructNum === 2) {
      this.setState({
        quizState: "pre",
      });

      console.log("pre-conf begin");
      setTimeout(
        function () {
          this.quizBegin();
        }.bind(this),
        10
      );
    } else if (whichButton === 3 && curInstructNum === 3) {
      // continue after a block break
      var blockNum = this.state.blockNum + 1;
      this.setState({
        instructScreen: false,
        taskScreen: true,
        taskSection: "iti",
        trialNumInBlock: 0,
        blockNum: blockNum,
      });

      setTimeout(
        function () {
          this.taskBegin();
        }.bind(this),
        10
      );
    } else if (whichButton === 3 && curInstructNum === 4) {
      this.setState({
        quizState: "post",
      });

      setTimeout(
        function () {
          this.quizBegin();
        }.bind(this),
        10
      );
    } else if (whichButton === 3 && curInstructNum === 5) {
      setTimeout(
        function () {
          this.redirectToNextTask();
        }.bind(this),
        0
      );
    }
  }

  handleGlobalConf(keyPressed) {
    var whichButton = keyPressed;
    if (
      whichButton === 3 &&
      this.state.quizScreen === true &&
      this.state.confLevel !== null
    ) {
      setTimeout(
        function () {
          this.renderQuizSave();
        }.bind(this),
        0
      );
    }
  }

  handleResp(keyPressed, timePressed) {
    //Check first whether it is a valid press
    var respTime =
      timePressed -
      (this.state.trialTime +
        this.state.fixTime +
        this.state.stimTime +
        this.state.encodeTime);

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
    var correctMat = this.state.correctMat.concat(correct);
    var responseMatrix = this.state.responseMatrix.concat(response);
    var correctPer =
      Math.round((utils.getAvg(correctMat) + Number.EPSILON) * 100) / 100; //2 dec pl

    this.setState({
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
      responseMatrix: responseMatrix,
      correctMat: correctMat,
      correctPer: correctPer,
    });

    setTimeout(
      function () {
        this.renderChoiceFb();
      }.bind(this),
      0
    );
  }

  handleConfResp(keyPressed, timePressed) {
    var whichButton = keyPressed;
    if (whichButton === 3 && this.state.confLevel !== null) {
      console.log("conf level: " + this.state.confLevel);
      var confTime =
        timePressed -
        [
          this.state.trialTime +
            this.state.fixTime +
            this.state.stimTime +
            this.state.encodeTime +
            this.state.respTime +
            this.state.respFbTime,
        ];

      this.setState({
        confTime: confTime,
      });

      setTimeout(
        function () {
          this.renderTaskSave();
        }.bind(this),
        10
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
  _handleGlobalConfKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        this.handleGlobalConf(keyPressed);
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
  _handleConfRespKey = (event) => {
    var keyPressed;
    var timePressed;

    console.log("Confidence: " + this.state.confLevel);

    switch (event.keyCode) {
      case 32:
        //    this is enter
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleConfResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  handleCallbackConf(callBackValue) {
    this.setState({ confLevel: callBackValue });
    //  console.log("Confidence is: " + callBackValue);

    //  if (this.state.confLevel !== null) {
    //    this.setState({ confMove: true });
    //}
  }

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    let instruct_text1 = (
      <div>
        <span>
          The spaceship needs to be repaired quickly - we need your help to sort
          the tools!
          <br /> <br />
          You will have {this.state.trialNumTotal} sets of tools to make your
          choice. This will be split over {this.state.blockNumTotal} sections
          with {this.state.trialNumPerBlock} sets of tools each so that you can
          take breaks in between.
          <br /> <br />
          If the tool on the <strong>left</strong> was shown previously,{" "}
          <strong>press W</strong>.
          <br /> <br />
          If the tool on the <strong>right</strong> was shown previously,{" "}
          <strong> press O</strong>.
          <br /> <br />
          Please respond quickly and to the best of your ability. This time, you{" "}
          <strong>will not</strong> be told whether your choice was correct or
          incorrect.
          <br /> <br />
          <center>
            Use the ← and → keys to navigate the pages.
            <br />
            <br />[<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>
          After making your choice, you will then rate your confidence in your
          judgement on the rating scale.
          <br /> <br />
          Please do your best to rate your confidence accurately and do take
          advantage of the <strong>whole length</strong> of the rating scale.
          <br /> <br />
          You will not be allowed to move on to the next set of batteries if you
          do not adjust the rating scale.
          <br /> <br />
          If you do well in the task, you can receive up to{" "}
          <strong>£2 bonus</strong>!
          <br /> <br />
          <center>
            When you are ready, please press the [<strong>SPACEBAR</strong>] to
            start.
            <br />
            <br />[<strong>←</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          You have completed {this.state.blockNum} out of{" "}
          {this.state.blockNumTotal} blocks!
          <br />
          <br />
          You can now pause for a break.
          <br />
          <br />
          <center>
            Press the [<strong>SPACEBAR</strong>] when you are ready to
            continue.
          </center>
        </span>
      </div>
    );

    let instruct_text4 = (
      <div>
        <span>
          Amazing!
          <br />
          <br />
          You have completed sorting through all of the tools!
          <br />
          <br />
          <center>
            Press the [<strong>SPACEBAR</strong>] to continue.
          </center>
        </span>
      </div>
    );

    let instruct_text5 = (
      <div>
        <span>
          Whew! Our spaceship is now fixed, thanks to the tools that you have
          selected.
          <br />
          <br />
          <center>
            Press the [<strong>SPACEBAR</strong>] to continue.
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
      default:
    }
  }

  quizText(quizState) {
    let quiz_text1 = (
      <div>
        <center>
          Before we begin, how well do you think you will be able to remember
          all the tools correctly?
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderGlobal.ConfSliderGlobal
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={this.state.confInitial}
          />
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          Press [SPACEBAR] to submit your answer and start sorting the tools.
          <br />
          <br />
          You will not allowed to move on unless you have adjusted the scale.
        </center>
      </div>
    );

    let quiz_text2 = (
      <div>
        <center>
          After going through all the tools, how well did you think you selected
          the tool you remembered correctly?
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderGlobal.ConfSliderGlobal
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={this.state.confInitial}
          />
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          Press [SPACEBAR] to continue.
          <br />
          <br />
          You will not allowed to move on unless you have adjusted the scale.
        </center>
      </div>
    );

    switch (quizState) {
      case "pre":
        return <div>{quiz_text1}</div>;
      case "post":
        return <div>{quiz_text2}</div>;
      default:
    }
  }

  quizBegin() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    document.addEventListener("keyup", this._handleGlobalConfKey);
    var initialValue = utils.randomInt(70, 80);

    console.log("Begining quiz");
    console.log("initialValue: " + initialValue);

    this.setState({
      confInitial: initialValue,
      confLevel: null,
      //  confMove: null,
      quizScreen: true,
      instructScreen: false,
      taskScreen: false,
      taskSection: "rating",
    });
  }

  taskBegin() {
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

  taskEnd() {
    this.setState({
      instructScreen: true,
      taskScreen: false,
      quizScreen: false,
      instructNum: 4,
      taskSection: null,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////
  // FOUR COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback and Confidence
  trialReset() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var trialNumInBlock = this.state.trialNumInBlock + 1;

    var choicePos = this.state.choicePosList[trialNum - 1]; //shuffle the order for the dotDiffLeft

    console.log("NEW TRIAL");
    // run staircase
    var s2 = staircase.staircase(
      this.state.stimNum,
      this.state.responseMatrix,
      this.state.stairDir,
      trialNum
    );

    var stimNum = s2.stimNum;
    var stairDir = s2.direction;
    var responseMatrix = s2.stepcount;

    //  console.log("dotsStair: " + choiceCor);
    //  console.log("stairDir: " + stairDir);
    //  console.log("responseMat: " + responseMatrix);

    var reversals;
    if (s2.reversal) {
      // Check for reversal. If true, add one to reversals variable
      reversals = 1;
    } else {
      reversals = 0;
    }

    // shuffle the  list of stimuli
    var stim = this.state.statePic;
    var stimWord = this.state.stateWord;
    utils.shuffleSame(stim, stimWord);

    stim = stim.filter(function (val) {
      return val !== undefined;
    });
    stimWord = stimWord.filter(function (val) {
      return val !== undefined;
    });

    //pick the number of stim to be shown, plus 1 more for the other option of 2AFC
    var stimPickNum = stimNum + 1;
    var stimPick = stim.slice([-stimPickNum]);
    var stimWordPick = stimWord.slice([-stimPickNum]);

    console.log("stimPickNum: " + stimPickNum);
    console.log("stimPick: " + stimPick);
    console.log("stimWordPick: " + stimWordPick);

    //this is the stim that is shown
    var stimPickShown = stimPick.slice(0, stimNum);
    var stimWordPickShown = stimWordPick.slice(0, stimNum);

    utils.shuffleSame(stimPickShown, stimWordPickShown); //shuffle the order shown

    stimPickShown = stimPickShown.filter(function (val) {
      return val !== undefined;
    });
    stimWordPickShown = stimWordPickShown.filter(function (val) {
      return val !== undefined;
    });

    console.log("stimPickShown: " + stimPickShown);
    console.log("stimWordPickShown: " + stimWordPickShown);

    //this is the stim for the 2AFC
    var choicePickShown = stimPick.slice(-2);
    var choiceWordPickShown = stimWordPick.slice(-2);

    console.log("choicePickShown: " + choicePickShown);
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
      quizScreen: false,
      trialNum: trialNum,
      trialNumInBlock: trialNumInBlock,
      taskSection: "iti",
      fixTime: 0,
      stimTime: 0,
      encodeTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      confLevel: null,
      confTime: 0,

      choice: null,
      correct: null,
      correctPer: null,
      choiceCor: choiceCor,
      choicePos: choicePos,

      stimShown: stimPickShown,
      stimWordShown: stimWordPickShown,
      choiceShownWordLeft: choiceShownWordLeft,
      choiceShownWordRight: choiceShownWordRight,

      stimNum: stimNum,
      reversals: reversals,
      stairDir: stairDir,
      responseMatrix: responseMatrix,

      choiceFbLeft: style.choiceWord,
      choiceFbRight: style.choiceWord,
      choiceFbRewLeft: style.choiceWord,
      choiceFbRewRight: style.choiceWord,
    });

    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  renderFix() {
    console.log("trialNumInBlock Fix: " + this.state.trialNumInBlock);

    var trialTime = Math.round(performance.now());
    console.log("render fix");
    //Show fixation
    this.setState({
      //  instructScreen: false,
      //  taskScreen: true,
      taskSection: "fixation",
      trialTime: trialTime,
    });

    setTimeout(
      function () {
        this.renderStim();
      }.bind(this),
      this.state.fixTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStim() {
    var fixTime = Math.round(performance.now()) - this.state.trialTime;
    console.log("render stim");
    this.setState({
      //    instructScreen: false,
      //    taskScreen: true,
      taskSection: "stimulus",
      fixTime: fixTime,
    });

    setTimeout(
      function () {
        this.renderEncode();
      }.bind(this),
      this.state.stimTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderEncode() {
    var stimTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime];

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "encode",
      stimTime: stimTime,
    });

    setTimeout(
      function () {
        this.renderChoice();
      }.bind(this),
      this.state.encodeTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoice() {
    document.addEventListener("keyup", this._handleRespKey);

    var encodeTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime + this.state.stimTime];

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choice",
      encodeTime: encodeTime,
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

    console.log(choice);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choiceFeedback",
      choiceFbLeft: choiceFbLeft,
      choiceFbRight: choiceFbRight,
    });

    setTimeout(
      function () {
        this.renderConfScale();
      }.bind(this),
      this.state.respFbTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderConfScale() {
    document.addEventListener("keyup", this._handleConfRespKey);

    var initialValue = utils.randomInt(70, 80);

    var respFbTime =
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.stimTime +
          this.state.encodeTime +
          this.state.respTime,
      ];

    this.setState({
      //      instructScreen: false,
      //      taskScreen: true,
      taskSection: "confidence",
      confInitial: initialValue,
      respFbTime: respFbTime,
    });

    // it will deploy the next trial with spacebar keypress
  }

  renderTaskSave() {
    document.removeEventListener("keyup", this._handleConfRespKey);

    console.log("trialNumInBlock Save: " + this.state.trialNumInBlock);

    var userID = this.state.userID;

    let saveString = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      trialNum: this.state.trialNum,
      blockNum: this.state.blockNum,
      trialNumInBlock: this.state.trialNumInBlock,
      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      stimTime: this.state.stimTime,
      encodeTime: this.state.encodeTime,

      stimPick: this.state.stimPick,
      stimWordPick: this.state.stimWordPick,
      stimShown: this.state.stimPickShown,
      stimWordShown: this.state.stimWordPickShown,
      choiceShownWordLeft: this.state.choiceShownWordLeft,
      choiceShownWordRight: this.state.choiceShownWordRight,

      responseKey: this.state.responseKey,
      respTime: this.state.respTime,
      respFbTime: this.state.respFbTime,
      choice: this.state.choice,
      confLevel: this.state.confLevel,
      confTime: this.state.confTime,
      correct: this.state.correct,
      correctMat: this.state.correctMat,
      correctPer: this.state.correctPer,

      // staircase parameters
      responseMatrix: this.state.responseMatrix,
      reversals: this.state.reversals,
      stairDir: this.state.stairDir,
      stimNum: this.state.stimNum,
    };

    // try {
    //   fetch(`${DATABASE_URL}/task_data/` + userID, {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(saveString),
    //   });
    // } catch (e) {
    //   console.log("Cant post?");
    // }

    console.log("trialNum: " + this.state.trialNum);
    console.log("trialNumPerBlock: " + this.state.trialNumPerBlock);
    console.log("trialNumInBlock: " + this.state.trialNumInBlock);
    console.log("trialNumTotal: " + this.state.trialNumTotal);

    if (this.state.trialNumInBlock === this.state.trialNumPerBlock) {
      //and not the last trial, because that will be sent to trialReset to end the task
      console.log("TIME FOR A BREAK");
      if (this.state.trialNum !== this.state.trialNumTotal) {
        console.log("REST TIME");
        setTimeout(
          function () {
            this.restBlock();
          }.bind(this),
          10
        );
      } else if (this.state.trialNum === this.state.trialNumTotal) {
        // have reached the end of the task
        console.log("END TASK");
        setTimeout(
          function () {
            this.taskEnd();
          }.bind(this),
          10
        );
      }
    } else if (this.state.trialNumInBlock !== this.state.trialNumPerBlock) {
      console.log("CONTINUE TIME");
      setTimeout(
        function () {
          this.trialReset();
        }.bind(this),
        10
      );
    } else {
      console.log("ERROR I HAVENT ACCOUNTED FOR");
    }
  }

  renderQuizSave() {
    document.removeEventListener("keyup", this._handleGlobalConfKey);
    var userID = this.state.userID;

    let saveString = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      quizState: this.state.quizState,
      confInitial: this.state.confInitial,
      confLevel: this.state.confLevel,
    };

    // try {
    //   fetch(`${DATABASE_URL}/prepost_conf/` + userID, {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(saveString),
    //   });
    // } catch (e) {
    //   console.log("Cant post?");
    // }

    if (this.state.quizState === "pre") {
      // begin the task
      console.log("BEGIN");
      setTimeout(
        function () {
          this.taskBegin();
        }.bind(this),
        10
      );
    } else if (this.state.quizState === "post") {
      //return to instructions
      this.setState({
        instructScreen: true,
        taskScreen: false,
        quizScreen: false,
        instructNum: 5,
        taskSection: null,
      });
    }
  }

  restBlock() {
    this.setState({
      instructScreen: true,
      instructNum: 3,
      taskScreen: false,
      taskSection: "break",
    });
  }

  redirectToNextTask() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    this.props.navigate("/Bonus", {
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        correctPer: this.state.correctPer,
      },
    });
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
        this.state.taskScreen === false &&
        this.state.quizScreen === false
      ) {
        document.addEventListener("keyup", this._handleInstructKey);
        document.addEventListener("keyup", this._handleBeginKey);
        text = <div> {this.instructText(this.state.instructNum)}</div>;
        console.log("Page: " + this.state.instructNum);
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === false &&
        this.state.quizScreen === true &&
        this.state.taskSection === "rating"
      ) {
        text = <div> {this.quizText(this.state.quizState)}</div>;
        console.log("Quiz state: " + this.state.quizState);
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "iti"
      ) {
        text = <div className={style.boxStyle}></div>;
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "fixation"
      ) {
        text = (
          <div className={style.boxStyle}>
            <br />
            <br />
            <DrawFix />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "stimulus"
      ) {
        text = (
          <div className={style.boxStyle}>
            <center>Memorise these tools:</center>
            <br />
            <br />
            <br />
            <br />
            <center>
              {this.renderImages(this.state.stimNum, this.state.stimShown)}
            </center>
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "encode"
      ) {
        text = <div className={style.boxStyle}></div>;
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "choice"
      ) {
        text = (
          <div className={style.boxStyle}>
            <center>Which tool was shown?</center>
            <br />
            <br />
            <br />
            <br />
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
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "choiceFeedback"
      ) {
        text = (
          <div className={style.boxStyle}>
            <center>Which tool was shown?</center>
            <br />
            <br />
            <br />
            <br />
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
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "confidence"
      ) {
        text = (
          <div>
            <center>
              Rate your confidence on the probability that your choice was
              correct:
            </center>
            <br />
            <br />
            <br />
            <br />
            <center>
              <ConfSlider.ConfSlider
                callBackValue={this.handleCallbackConf.bind(this)}
                initialValue={this.state.confInitial}
              />
            </center>
            <br />
            <br />
            <br />
            <br />
            <center>
              Press [SPACEBAR] to continue.
              <br />
              <br />
              You will not allowed to move on unless you have adjusted the
              scale.
            </center>
          </div>
        );
      } else {
        console.log("ERROR CAN'T FIND THE RIGHT PAGE");
        return null;
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

export default withRouter(MetaMemTask);
