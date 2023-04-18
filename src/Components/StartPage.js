import React from "react";
import * as Consent from "survey-react";
import "../../node_modules/survey-react/survey.css";
import "./style/surveyStyle.css";
import withRouter from "./withRouter";

//import { json } from "./consent/consent.js"; //short for debugging
import { json } from "./consent/consentFull.js";

import butterfly from "./ani-stim/butterfly.jpg";
import ladybug from "./ani-stim/ladybug.jpg";
import snail from "./ani-stim/snail.jpg";
import frog from "./ani-stim/frog.jpg";
import beetle from "./ani-stim/beetle.jpg";
import ant from "./ani-stim/ant.jpg";
//import camel from "./ani-stim/camel.jpg";
import owl from "./ani-stim/owl.jpg";
import tiger from "./ani-stim/tiger.jpg";
import panther from "./ani-stim/panther.jpg";
import bear from "./ani-stim/bear.jpg";
import snake from "./ani-stim/snake.jpg";
import gorilla from "./ani-stim/gorilla.jpg";
import spider from "./ani-stim/spider.jpg";
//import buffalo from "./ani-stim/waterbuffalo.jpg";

////////////////
var stateWord = [
  "butterfly",
  "ladybug",
  "snail",
  "frog",
  "beetle",
  "ant",
  "owl",
  "tiger",
  "panther",
  "bear",
  "snake",
  "gorilla",
  "spider",
];

var statePic = [
  butterfly,
  ladybug,
  snail,
  frog,
  beetle,
  ant,
  owl,
  tiger,
  panther,
  bear,
  snake,
  gorilla,
  spider,
];

class StartPage extends React.Component {
  constructor(props) {
    super(props);

    // Get data and time
    var dateTime = new Date().toLocaleString();

    var currentDate = new Date(); // maybe change to local
    var date = currentDate.getDate();
    var month = currentDate.getMonth(); //Be careful! January is 0 not 1
    var year = currentDate.getFullYear();
    var dateString = date + "-" + (month + 1) + "-" + year;
    var timeString = currentDate.toTimeString();

    // ID number - either set or get from url
    //  var userID = Math.floor(100000 + Math.random() * 900000);
    //var userID = 120000; //for testing

    const userID = this.props.state.userID;

    // Set state
    this.state = {
      userID: userID,
      date: dateString,
      dateTime: dateTime,
      startTime: timeString,

      statePic: statePic,
      stateWord: stateWord,

      consentComplete: 0,
    };

    this.redirectToTarget = this.redirectToTarget.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";

    var statePic = this.state.statePic;

    [statePic].forEach((image) => {
      new Image().src = image;
    });

    this.setState({
      statePic: statePic,
      mounted: 1,
    });
  }

  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state, callback) => {
      return;
    };
  }

  redirectToTarget() {
    this.setState({
      consentComplete: 1,
    });

    //On click consent, sent to tutorial page with the props
    this.props.navigate("/MetaMemPreTut?PROLIFIC_PID=" + this.state.userID, {
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        statePic: this.state.statePic,
        stateWord: this.state.stateWord,
      },
    });

    console.log("UserID is: " + this.state.userID);
  }

  render() {
    Consent.StylesManager.applyTheme("default");

    if (this.state.consentComplete === 0) {
      return (
        <div className="textBox">
          <center>
            <strong>INFORMATION FOR THE PARTICIPANT</strong>
          </center>
          <br />
          Please read this information page carefully. If you are happy to
          proceed, please check the boxes on the second page of this form to
          consent to this study proceeding. Please note that you cannot proceed
          to the study unless you give your full consent.
          <br />
          <br />
          <Consent.Survey
            json={json}
            showCompletedPage={false}
            onComplete={this.redirectToTarget}
          />
        </div>
      );
    } else {
      return null;
    }
  }
}

export default withRouter(StartPage);
