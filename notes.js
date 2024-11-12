import React from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const ErrorComponent = () => {
  const navigate = useNavigate(); // Use navigate hook

  return (
    <div className="container">
      <center>
        <h3>This page doesn't exist</h3>
        <Button
          style={{
            background: "#000053",
            margin: "10px 0px"
          }}
          onClick={() => {
            if (window.location.href.includes("deck"))
              navigate("/deck/ciconfig");
            else navigate("/");
          }}
        >
          Go to Homepage
        </Button>
      </center>
    </div>
  );
};

export default ErrorComponent;
