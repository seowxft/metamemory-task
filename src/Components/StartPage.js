import React from "react";
import * as Consent from "survey-react";
import "../../node_modules/survey-react/survey.css";
import "./style/surveyStyle.css";
import withRouter from "./withRouter";

//import { json } from "./consent/consent.js"; //short for debugging
import { json } from "./consent/consentFull.js";

import blade from "./stim/blade.svg";
import cone from "./stim/cone.svg";
import drill from "./stim/drill.svg";
import hammer from "./stim/hammer.svg";
import knife from "./stim/knife.svg";
import lighthead from "./stim/lighthead.svg";
import nails from "./stim/nails.svg";
import paint from "./stim/paint.svg";
import paintbrush from "./stim/paintbrush.svg";
import saw from "./stim/saw.svg";
import screwdriver from "./stim/screwdriver.svg";
import spanner from "./stim/spanner.svg";

////////////////
var stateWord = [
  "blade",
  "cone",
  "drill",
  "hammer",
  "knife",
  "lighthead",
  "nails",
  "paint",
  "paintbrush",
  "saw",
  "screwdriver",
  "spanner",
];

var statePic = [
  blade,
  cone,
  drill,
  hammer,
  knife,
  lighthead,
  nails,
  paint,
  paintbrush,
  saw,
  screwdriver,
  spanner,
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
    var prolific_id = Math.floor(100000 + Math.random() * 900000);
    //var prolific_id = 120000; //for testing

    //let url = this.props.location.search;
    //let params = queryString.parse(url);
    //const prolific_id =
    //  params["USER_PID"] === undefined ? "undefined" : params["USER_PID"];
    //console.log(prolific_id);

    // Set state
    this.state = {
      userID: prolific_id,
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
    this.props.navigate("/MetaMemTut", {
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
