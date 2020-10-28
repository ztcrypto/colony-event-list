import React, { useState, useEffect, useRef } from "react";
import EventsListItem from "./EventsListItem";
import "./EventsList.css";
import getEventLogs from "../utils/getEventLogs";
import EventLogger from "../utils/EventLogger";
import { Event } from "../types";
import InfiniteScroll from "react-infinite-scroll-component";

const displayName = "EventsList";

function EventsList() {
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [curEventsList, setCurEventsList] = useState<Event[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [curLength, setCurLength] = useState<number>(10);
  const totalLength = useRef<number>();
  useEffect(() => {
    const eventLogger = new EventLogger();
    eventLogger.init();
    getEventLogs().then((events: Event[]) => {
      console.log(events);
      setEventsList(events);
      totalLength.current = events.length;
      setCurEventsList(events.slice(0, curLength));
    });
  }, []);

  const fetchMoreData = () => {
    if (!hasMore) return;
    let newLength = curLength + 10;
    if (newLength > eventsList.length) {
      newLength = eventsList.length;
      setHasMore(false);
    }
    setCurLength(newLength);
    setCurEventsList(eventsList.slice(0, newLength));
  };

  return (
    <div className="eventsList">
      <InfiniteScroll
        dataLength={curEventsList.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4 className="textCenter">Loading...</h4>}
      >
        {curEventsList.map((item: Event, index) => {
          return <EventsListItem data={item} key={index} />;
        })}
      </InfiniteScroll>
    </div>
  );
}

EventsList.displayName = displayName;

export default EventsList;
