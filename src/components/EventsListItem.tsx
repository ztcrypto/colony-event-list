import React from "react";
import "./EventsListItem.css";
import makeBlockie from "ethereum-blockies-base64";
import { Event, EventTypes } from "../types";
import dateFormat from "../utils/dateFormat";

const displayName = "EventsListItem";

interface Props {
  data: Event;
}

function EventsListItem({ data }: Props) {
  let content = null;
  if (data.name === EventTypes.DOMAIN_ADDED) {
    content = (
      <p className="firstItem">
        Domain <span>{data.domainId}</span> added.
      </p>
    );
  } else if (data.name === EventTypes.COLONY_INITIALIZED) {
    content = (
      <p className="firstItem">
        Congratulations! It's a beautiful baby colony!
      </p>
    );
  } else if (data.name === EventTypes.COLONY_ROLE_SET) {
    content = (
      <p className="firstItem">
        <span>{data.role}</span> role assigned to user{" "}
        <span>{data.userAddress}</span> in domain <span>{data.domainId}</span>.
      </p>
    );
  } else {
    content = (
      <p className="firstItem">
        User <span>{data.userAddress}</span> claimed <span>{data.amount}</span>{" "}
        <span>{data.token}</span> payout from pot{" "}
        <span>{data.fundingPotId}</span>.
      </p>
    );
  }
  return (
    <div className="eventsListItem">
      <div className="avatar">
        <img
          src={makeBlockie(data.userAddress || data.transactionHash)}
          width="37"
          height="37"
        />
      </div>
      <div className="content">
        {content}
        <p className="secondItem">
          <span>{dateFormat(new Date(data.logTime))}</span>
          <a
            target="_new"
            href={`https://etherscan.io/tx/${data.transactionHash}`}
          >
            Etherscan.io
          </a>
        </p>
      </div>
    </div>
  );
}

EventsListItem.displayName = displayName;

export default EventsListItem;
