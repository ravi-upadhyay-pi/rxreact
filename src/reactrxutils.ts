import {Subscriber} from 'rxjs';

interface Event<T> {
    target: T
}

function feedEvent(subscriber: Subscriber<Event<any>>) {
    return (e: Event<any>) => subscriber.next(e);
}

function feedValue(subscriber: Subscriber<string>) {
    return (e: Event<HTMLInputElement>) => subscriber.next(e.target.value);
}

function feedNamedValue(subscriber: Subscriber<{[key: string]: string}>) {
    return (e: Event<HTMLInputElement>) => subscriber.next({[e.target.name]: e.target.value});
}

export {
  feedEvent,
  feedValue,
  feedNamedValue,
};
