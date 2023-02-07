import React from "react";
import DrawFix from "./DrawFix";
import style from "./style/taskStyle.module.css";
import * as ConfSliderEx from "./DrawConfSliderExample.js";
import * as staircase from "./staircase.js";
import * as utils from "./utils.js";
import withRouter from "./withRouter.js";
import astrodude from "./img/astronaut.png";

//import { DATABASE_URL } from "./config";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TUTORIAL SESSION + QUIZ FOR THE TASK
// Session includes:
// 1) Introduction to cover story
// 2) Practice on left/right box with feedback
// 3) Instructions to confidence rating
// 4) Quiz on instructions

class MetaMemTut extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    //when deug
    //  const userID = 100;
    //  const date = 100;
    //  const startTime = 100;

    const userID = this.props.state.userID;
    const date = this.props.state.date;
    const startTime = this.props.state.startTime;

    const statePic = this.props.state.statePic;
    const stateWord = this.props.state.stateWord;

    var trialNumTotal = 10; //26

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
      userID: userID,
      date: date,
      startTime: startTime,
      astrodude: astrodude,

      //section paramters
      sectionTime: sectionTime,
      section: "tutorial",

      // trial timings in ms
      fixTimeLag: 1000, //1000
      stimTimeLag: 1500, //1500
      encodeTimeLag: 1000,
      respFbTimeLag: 700, //
      fbTimeLag: 500, //500 correct or wrong

      // stimuli
      stateWord: stateWord,
      statePic: statePic,
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
      encodeTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      rewFbTime: 0,
      choice: null,
      confLevel: null,
      confTime: 0,

      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,

      // staircase parameters
      responseMatrix: [true, true],
      reversals: 0,
      stairDir: ["up", "up"],
      stimNum: 2,

      //quiz paramters
      quizTry: 1,
      quizNumTotal: 5,
      quizNum: 0,
      quizPressed: null,
      quizCor: null,
      quizCorTotal: null,
      quizAns: [3, 1, 1, 2, 3],

      // screen parameters
      instructScreen: true,
      instructNum: 1, //start from 1
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
    this.handleNextResp = this.handleNextResp.bind(this);
    this.handleQuizResp = this.handleQuizResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.quizText = this.quizText.bind(this);

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

    if (whichButton === 1 && curInstructNum >= 2 && curInstructNum <= 6) {
      // from page 2 to 5, I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 1 &&
      curInstructNum <= 5
    ) {
      // from page 1 to 4, I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    } else if (
      whichButton === 1 &&
      curInstructNum >= 8 &&
      curInstructNum <= 10
    ) {
      // from page 7 to 10, I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 7 &&
      curInstructNum <= 9
    ) {
      // from page 6 to 9, I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;
    if (whichButton === 3 && curInstructNum === 6) {
      setTimeout(
        function () {
          this.tutorBegin();
        }.bind(this),
        0
      );
    } else if (whichButton === 3 && curInstructNum === 10) {
      setTimeout(
        function () {
          this.quizBegin();
        }.bind(this),
        0
      );
    } else if (whichButton === 3 && curInstructNum === 11) {
      setTimeout(
        function () {
          this.redirectToNextTask();
        }.bind(this),
        0
      );
    }
  }

  handleResp(keyPressed, timePressed) {
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
    var responseMatrix = this.state.responseMatrix.concat(response);
    var correctMat = this.state.correctMat.concat(correct);
    var correctPer =
      Math.round((utils.getAvg(correctMat) + Number.EPSILON) * 100) / 100; //2 dec pl

    this.setState({
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
      correctMat: correctMat,
      correctPer: correctPer,
      responseMatrix: responseMatrix,
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
            this.state.stimTime +
            this.state.encodeTime +
            this.state.respTime +
            this.state.respFbTime,
        ];

      this.setState({
        rewFbTime: rewFbTime,
      });

      document.removeEventListener("keyup", this._handleNextRespKey);
      setTimeout(
        function () {
          this.renderTutorSave();
        }.bind(this),
        0
      );
    }
  }

  handleQuizResp(keyPressed, timePressed) {
    var quizNum = this.state.quizNum;
    var whichButton = keyPressed;

    var quizTime = timePressed - this.state.trialTime;

    var quizCorTotal = this.state.quizCorTotal;
    var quizCor;

    // calculate if quiz was correct or not
    if (whichButton === this.state.quizAns[quizNum - 1]) {
      quizCorTotal = quizCorTotal + 1;
      quizCor = 1;
      this.setState({
        quizPressed: whichButton,
        quizCor: quizCor,
        quizCorTotal: quizCorTotal,
        quizTime: quizTime,
      });
    } else {
      //if was incorrect
      quizCor = 0;
      this.setState({
        quizPressed: whichButton,
        quizCor: quizCor,
        quizTime: quizTime,
      });
    }

    console.log("Keypress: " + whichButton);
    console.log("QuizTime: " + quizTime);
    console.log("QuizNum: " + quizNum);
    console.log("QuizCor: " + quizCor);
    console.log("QuizCorTotal: " + quizCorTotal);
    console.log("QuizAns: " + this.state.quizAns);
    console.log("quizNumTotal: " + this.state.quizNumTotal);

    setTimeout(
      function () {
        this.renderQuizSave();
      }.bind(this),
      0
    );
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

  handleCallbackConf(callBackValue) {
    this.setState({ confValue: callBackValue });
  }

  // handle key keyPressed
  _handleQuizKey = (event) => {
    var keyPressed;
    var timePressed;

    switch (event.keyCode) {
      case 49:
        keyPressed = 1;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      case 50:
        keyPressed = 2;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      case 51:
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      case 52:
        keyPressed = 4;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// INSTRUCTION TEXT ////

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    let quizFeedback1;
    let quizFeedback2;

    if (this.state.quizTry > 1) {
      quizFeedback1 =
        "You scored " +
        this.state.quizCorTotal +
        "/5 correctly. Please read the instructions carefully.";
      quizFeedback2 =
        "Your task is to choose the tool that was shown previously.";
    } else {
      quizFeedback1 = "Well done!";
      quizFeedback2 =
        "You saw that choosing the tool that was shown previously was the correct answer.";
    }

    let instruct_text1 = (
      <div>
        <span>
          Welcome to spaceship, engineer!
          <br /> <br />
          The ship has been damaged with an asteriod hit, and we are glad you
          are here to help.
          <br /> <br />
          As the engineer, we need you to repair the damaged parts of the
          spaceship. However, the tools we need were scattered in the impact -
          we need your assistance in selecting the ones that we need.
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
        <span>We have a variety of tools on board:</span>
        <br />
        <br />
        <span>
          <center>{this.renderImages(9, this.state.statePic)}</center>
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
          As there are many tools available, we will show you a selection of
          them at one time. You will have to <strong>memorise</strong> the
          spread of tools shown. Thereafter, when we ask which one you have
          seen, you should choose <strong>the tool you previously saw</strong>.
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
              src={this.state.statePic[2]}
              alt="stim1"
            />
            <img
              className={style.instructStimDis}
              src={this.state.statePic[4]}
              alt="stim2"
            />
            <img
              className={style.instructStimDis}
              src={this.state.statePic[7]}
              alt="stim3"
            />
            <br />
            <br />
          </center>
        </span>
        <span>
          Try to remember all of these tools shown!
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
          Next, we will show you a choice between two tools. You can select the
          one that you previously saw with a keypress.
          <br />
          <br />
          <center>
            For instance:
            <br />
            <br />
            <span className={style.choiceWord}>{this.state.stateWord[7]}</span>
            &nbsp;or&nbsp;
            <span className={style.choiceWord}>{this.state.stateWord[8]}</span>
            <br />
            <br />
          </center>
          If the tool on the <strong>left</strong> was present previously,{" "}
          <strong>press W</strong>.
          <br />
          If the tool on the <strong>right</strong> was present previously,{" "}
          <strong>press O</strong>.
          <br />
          <br />
          Your selected tool will be outlined in{" "}
          <font color="#87C1FF">
            <strong>light blue</strong>
          </font>
          .
          <br />
          <br />
          Previously we saw <strong>{this.state.stateWord[7]}</strong>, not{" "}
          {this.state.stateWord[8]}, and so we should choose as such:
          <br />
          <br />
          <center>
            <br />
            <br />
            <span className={style.choiceWordChosen}>
              {this.state.stateWord[7]}
            </span>
            &nbsp;or&nbsp;
            <span className={style.choiceWord}>{this.state.stateWord[8]}</span>
            <br />
            <br />
          </center>
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
          Please respond quickly and to the best of your ability - the
          spaceship&apos;s repair depends on it!
          <br />
          <br />
          Let&apos;s start with a practice. In this phase we will tell you
          whether your choices are right or wrong.
          <br />
          <br />
          If you are <strong>correct</strong>, the tool that you selected will
          have its outline turn{" "}
          <font color="green">
            <strong>green</strong>
          </font>
          .
          <br />
          <br />
          If you are <strong>incorrect</strong>, the tool that you selected will
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

    let instruct_text6 = (
      <div>
        <span>
          You will have {this.state.trialNumTotal} chances to choose the correct
          tools.
          <br />
          <br />
          For every choice, you will be presented with a white cross in the
          middle of the screen first before a selection of tools will appear.
          Please pay attention closely as the tools will be{" "}
          <strong>flashed quickly only once</strong>.
          <br />
          <br />
          You will then be shown two tools - make your selection of{" "}
          <strong>the tool you previously saw</strong>.
          <br />
          <br />
          As a reminder:
          <br />
          <br />
          <strong>Press W</strong> to choose the tool on the{" "}
          <strong>left</strong>.
          <br />
          <strong>Press O</strong> to choose the tool on the{" "}
          <strong>right</strong>.
          <br />
          <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to begin the practice.
          </center>
          <br />
          <center>
            [<strong>←</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text7 = (
      <div>
        <span>
          {quizFeedback1}
          <br />
          <br />
          {quizFeedback2}
          <br />
          <br />
          During the main task, you will also have to indicate your{" "}
          <strong>confidence</strong> in your choice of the tool you pick.
          <br />
          <br />
          After every choice, we will show you a rating scale to rate the{" "}
          <strong>probability that your choice was correct</strong>:
          <br />
          <br />
          <br />
          <br />
          <center>
            <ConfSliderEx.ConfSliderEx1
              callBackValue={this.handleCallbackConf.bind(this)}
              initialValue={68}
            />
          </center>
          <br />
          <br />
          <br />
          <center>
            Use the ← and → keys to navigate the pages.
            <br />
            <br />[<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text8 = (
      <div>
        If you are <strong>very unsure</strong> that you made a correct
        judgement, you should select a 50% chance of being correct, or the{" "}
        <strong>left</strong> end of the scale. It means that your choice was a
        complete guess.
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderEx.ConfSliderEx1
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={50}
          />
        </center>
        <br />
        <br />
        <br />
        If you are <strong>very sure</strong> that you made a correct judgement,
        you should select a 100% chance of being correct, or the{" "}
        <strong>right</strong> end of the scale. It means that you are
        absolutely certain that your choice was correct.
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderEx.ConfSliderEx1
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={100}
          />
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          [<strong>←</strong>] [<strong>→</strong>]
        </center>
      </div>
    );

    let instruct_text9 = (
      <div>
        If you are <strong>somewhat sure</strong> that you made a correct
        judgement, you should select a rating between the two ends of the scale.
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderEx.ConfSliderEx1
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={75}
          />
        </center>
        <br />
        <br />
        <br />
        <br />
        You can use the slider by clicking any point along the scale, or
        dragging the circle indicator along the scale. You can try it out for
        yourself above.
        <br />
        <br />
        During the main task, once you have selected your rating, you will have
        to press the [<strong>SPACEBAR</strong>] to confirm it and move on to
        the next set of battery cards.
        <br />
        <br />
        <center>
          [<strong>←</strong>] [<strong>→</strong>]
        </center>
      </div>
    );

    let instruct_text10 = (
      <div>
        Before you begin, you have to pass a quick quiz to make sure that you
        have understood the key points of your task for today.
        <br />
        <br />
        Note: You will have to get <strong>all</strong> quiz questions correct.
        If not, you be sent back to the instructions and will have to retake the
        quiz!
        <br />
        <br />
        <center>
          Press [<strong>SPACEBAR</strong>] to begin the quiz.
        </center>
        <br />
        <center>
          [<strong>←</strong>]
        </center>
      </div>
    );

    let instruct_text11 = (
      <div>
        Amazing! You scored {this.state.quizCorTotal}/{this.state.quizNumTotal}{" "}
        for the quiz.
        <br />
        <br />
        You are ready to start the main task.
        <br />
        <br />
        <center>
          Press [<strong>SPACEBAR</strong>] to begin.
        </center>
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
      case 7:
        return <div>{instruct_text7}</div>;
      case 8:
        return <div>{instruct_text8}</div>;
      case 9:
        return <div>{instruct_text9}</div>;
      case 10:
        return <div>{instruct_text10}</div>;
      case 11:
        return <div>{instruct_text11}</div>;
      default:
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// QUIZ TEXT ////
  // Do I need to randomise this?

  quizText(quizNum) {
    let quiz_text1 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> You are first shown a variety of
        tools. What do you do?
        <br />
        <br />
        [1] - I try to figure out which tool is not there.
        <br />
        [2] - I count the number of tools shown.
        <br />
        [3] - I memorise the tools that are shown.
        <br />
        [4] - I am unsure.
      </div>
    );

    let quiz_text2 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> Next, you are shown a choice
        between two tools, as words. What do you do?
        <br />
        <br />
        [1] - I select the tool that was shown previously.
        <br />
        [2] - I select the tool that was not shown previously.
        <br />
        [3] - I select both tools.
        <br />
        [4] - I am unsure.
      </div>
    );

    let quiz_text3 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> You have made your choice on the
        battery card with the higher charge. However, you are{" "}
        <strong>very unsure</strong> about your choice. How would you rate your
        confidence on the rating scale?
        <br />
        <br />
        [1] - I would pick the left end of the scale (50% correct).
        <br />
        [2] - I would pick the right end of the scale (100% correct).
        <br />
        [3] - I would pick somwhere in between the ends of the scale.
        <br />
        [4] - I am unsure.
      </div>
    );

    let quiz_text4 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> On the next set of battery
        cards, you are <strong>very sure</strong> about your choice. How would
        you rate your confidence on the rating scale?
        <br />
        <br />
        [1] - I would pick the left end of the scale (50% correct).
        <br />
        [2] - I would pick the right end of the scale (100% correct).
        <br />
        [3] - I would pick somwhere in between the ends of the scale.
        <br />
        [4] - I am unsure.
      </div>
    );

    let quiz_text5 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> On the next set of battery
        cards, you are <strong>somewhat sure</strong> about your choice. How
        would you rate your confidence on the rating scale?
        <br />
        <br />
        [1] - I would pick the left end of the scale (50% correct).
        <br />
        [2] - I would pick the right end of the scale (100% correct).
        <br />
        [3] - I would pick somwhere in between the ends of the scale.
        <br />
        [4] - I am unsure.
      </div>
    );

    switch (quizNum) {
      case 1:
        return <div>{quiz_text1}</div>;
      case 2:
        return <div>{quiz_text2}</div>;
      case 3:
        return <div>{quiz_text3}</div>;
      case 4:
        return <div>{quiz_text4}</div>;
      case 5:
        return <div>{quiz_text5}</div>;
      default:
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// TASK TOGGLES ////

  tutorBegin() {
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

  tutorEnd() {
    // change state to make sure the screen is changed for the task
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 7,
      taskSection: null,
    });
  }

  quizBegin() {
    // remove access to left/right/space keys for the instructions
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    document.addEventListener("keyup", this._handleQuizKey);

    // If I want to shuffle quiz answers?

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "quiz",
      quizPressed: null,
      quizNum: 1,
      quizCorTotal: 0,
      quizCor: null,
    });
  }

  quizReset() {
    var quizNum = this.state.quizNum;
    var quizCorTotal = this.state.quizCorTotal;
    var trialTime = Math.round(performance.now());

    if (quizNum < this.state.quizNumTotal) {
      //go to next quiz qn
      this.setState({
        quizNum: quizNum + 1,
        trialTime: trialTime,
      });
    } else if (quizNum === this.state.quizNumTotal) {
      document.removeEventListener("keyup", this._handleQuizKey);
      //end quiz, head back to instructions

      //if full marks
      if (quizCorTotal === this.state.quizNumTotal) {
        console.log("PASS QUIZ");
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 11,
          taskSection: "instruct",
        });
      } else {
        //if they got one wrong
        console.log("fAIL QUIZ");
        var quizTry = this.state.quizTry + 1;
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 7,
          taskSection: "instruct",
          quizTry: quizTry,
        });
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////////
  // FOUR COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback and Confidence
  trialReset() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var choicePos = this.state.choicePosList[trialNum - 1]; //shuffle the order for the choice

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

    console.log("stimNum: " + stimNum);
    console.log("stairDir: " + stairDir);
    console.log("responseMat: " + responseMatrix);

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
      taskSection: "iti",
      trialNum: trialNum,
      fixTime: 0,
      stimTime: 0,
      encodeTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      rewFbTime: 0,
      confLevel: null,
      confTime: 0,

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

      stimNum: stimNum,
      stairDir: stairDir,
      reversals: reversals,
      responseMatrix: responseMatrix,

      choiceFbLeft: style.choiceWord,
      choiceFbRight: style.choiceWord,
      choiceFbRewLeft: style.choiceWord,
      choiceFbRewRight: style.choiceWord,
    });

    console.log(this.state.trialNum);
    console.log(this.state.trialNumTotal);

    if (trialNum < this.state.trialNumTotal + 1) {
      setTimeout(
        function () {
          this.renderFix();
        }.bind(this),
        0
      );
    } else {
      // if the trials have reached the total trial number
      setTimeout(
        function () {
          this.tutorEnd();
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
        this.renderStim();
      }.bind(this),
      this.state.fixTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStim() {
    var fixTime = Math.round(performance.now()) - this.state.trialTime;

    this.setState({
      instructScreen: false,
      taskScreen: true,
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
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.stimTime +
          this.state.encodeTime +
          this.state.respTime,
      ];

    var choice = this.state.choice;
    var correct = this.state.correct;
    var choiceFbRewLeft;
    var choiceFbRewRight;
    var choiceFbRewText;

    console.log(choice);
    console.log(correct);

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

  renderTutorSave() {
    var userID = this.state.userID;

    let saveString = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      trialNum: this.state.trialNum,
      stimNum: this.state.stimNum,
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
      rewFbTime: this.state.rewFbTime,
      choice: this.state.choice,
      confLevel: this.state.confLevel,
      confTime: this.state.confTime,
      correct: this.state.correct,
      correctMat: this.state.correctMat,
      correctPer: this.state.correctPer,
    };

    // try {
    //   fetch(`${DATABASE_URL}/tutorial_data/` + userID, {
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

    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      10
    );
  }

  renderQuizSave() {
    var userID = this.state.userID;

    let saveString = {
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      //quiz paramters
      quizTry: this.state.quizTry,
      quizNumTotal: this.state.quizNumTotal,
      quizNum: this.state.quizNum,
      trialTime: this.state.trialTime,
      quizPressed: this.state.quizPressed,
      quizTime: this.state.quizTime,
      quizCor: this.state.quizCor,
      quizCorTotal: this.state.quizCorTotal,
    };

    // try {
    //   fetch(`${DATABASE_URL}/quiz_test/` + userID, {
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

    setTimeout(
      function () {
        this.quizReset();
      }.bind(this),
      10
    );
  }

  redirectToNextTask() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    this.props.navigate("/MetaMemTask", {
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        statePic: this.state.statePic,
        stateWord: this.state.stateWord,
        stimNum: this.state.stimNum,
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
        console.log("THIS SHOULD BE INSTRUCTION BLOCK");
        console.log(this.state.instructNum);
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
          <div className={style.boxStyle}>
            <br />
            <br />
            <DrawFix />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
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
        this.state.taskScreen === true &&
        this.state.taskSection === "corFeedback"
      ) {
        text = (
          <div className={style.boxStyle}>
            <br />
            <br />
            <br />
            <br />
            <center>{this.state.choiceFbRewText}</center>
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
            <br />
            <br />
            <center>Press the [SPACEBAR] to continue.</center>
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "quiz"
      ) {
        text = (
          <div>
            {this.quizText(this.state.quizNum)}
            <br />
            <br />
            <center>Please use the top row number keys to respond.</center>
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

export default withRouter(MetaMemTut);
