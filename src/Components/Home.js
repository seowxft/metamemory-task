import screenfull from "screenfull";
import React from "react";
import withRouter from "./withRouter.js";
import style from "./style/taskStyle.module.css";
import queryString from "query-string";

class Home extends React.Component {
  constructor(props) {
    super(props);

    // ID number - either set or get from url
    //var prolific_id = Math.floor(100000 + Math.random() * 900000);
    //var prolific_id = 120000; //for testing

    const queryParams = new URLSearchParams(window.location.search);
    const prolific_id = queryParams.get("PROLIFIC_PID");

    console.log("ID: " + prolific_id); //pizza

    //  let url = this.props.location.search;
    //  console.log(url);
    //  let params = queryString.parse(url);
    //  const prolific_id =
    //    params["PROLIFIC_PID"] === undefined
    //      ? "undefined"
    //      : params["PROLIFIC_PID"];
    //  console.log(prolific_id);

    // Set state
    this.state = {
      userID: prolific_id,
    };

    this.redirectToTarget = this.redirectToTarget.bind(this);
  }

  redirectToTarget() {
    //On click consent, sent to tutorial page with the props
    this.props.navigate("/StartPage?PROLIFIC_PID=" + this.state.userID, {
      state: {
        userID: this.state.userID,
      },
    });

    console.log("UserID: " + this.state.userID);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";

    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        console.log("Am I fullscreen?", screenfull.isFullscreen ? "Yes" : "No");
      });
    }
  }

  // enabling fullscreen has to be done after some user input
  toggleFullScreen = () => {
    if (screenfull.isEnabled) {
      screenfull.request();
    }
  };

  render() {
    let text;

    text = (
      <div>
        <span>
          Please use either <strong>Chrome</strong> or <strong>Firefox</strong>{" "}
          - we cannot guarantee support on other browsers.
          <br />
          <br />
          To take part in the experiment, your browser must be{" "}
          <strong>maximised</strong> and be in <strong>fullscreen mode</strong>.
          This ensures that all graphics will be displayed in their correct
          dimensions.
          <br />
          <br />
          First, please ensure that your browser is maximised. When you are
          ready, click the [<strong>Start</strong>] button below. Fullscreen
          mode will be automatically enabled and you will be brought to the
          consent pages.
          <br />
          <br />
          Please <strong>do not refresh the webpage</strong> at any point in the
          study. You will not be able to return to the same page.
          <br />
          <br />
          Note: If you encounter a technical issue during the study, please take
          a screenshot of the error and send a message with details of the
          current broswer you are using to the researcher on Profilic.
          <br />
          <br />
          <center>
            <button
              onClick={() => {
                this.toggleFullScreen();
                this.redirectToTarget();
              }}
            >
              Start
            </button>
          </center>
        </span>
      </div>
    );

    return (
      <div className={style.bg}>
        <div className={style.textFrame}>
          <div className={style.fontStyle}>{text}</div>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
