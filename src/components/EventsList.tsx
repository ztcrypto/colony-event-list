import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "react-spinner-material";
import EventsListItem from "./EventsListItem";
import "./EventsList.css";
import EventLogger from "../utils/EventLogger";
import { Event } from "../types";

const displayName = "EventsList";
const eventLogger = new EventLogger();

function EventsList() {
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    eventLogger.getConvertedLogs(0).then((events) => {
      setEventsList(events);
    });
  }, []);

  useEffect(() => {
    if (eventsList.length && eventsList.length === eventLogger.events.length)
      setHasMore(false);
  }, [eventsList]);

  const fetchMoreData = () => {
    if (!hasMore) return;
    setTimeout(() => {
      eventLogger
        .getConvertedLogs(eventsList.length)
        .then((events: Event[]) => {
          setEventsList(eventsList.concat(events));
        });
    }, 100);
  };

  return (
    <div className="eventsList">
      <InfiniteScroll
        dataLength={eventsList.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="spinnerDiv">
            <Spinner radius={50} color={"#333"} stroke={2} visible={true} />
          </div>
        }
      >
        {eventsList.map((item: Event, index) => {
          return <EventsListItem data={item} key={index} />;
        })}
      </InfiniteScroll>
    </div>
  );
}

EventsList.displayName = displayName;

export default EventsList;
