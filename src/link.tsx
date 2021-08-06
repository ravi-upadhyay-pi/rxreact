import { React } from './reactrx';
import { Subject } from 'rxjs';

export interface LinkProp {
    route: Subject<string>;
    href: string;
    className?: string;
    onclick?: () => void;
}

export function Link({route, href, className, onclick}: LinkProp, ...children: JSX.Element[]): JSX.Element {
    className = className || "";
    let onclickHandler = (event: any) => {
        event.preventDefault();
        route.next(href)
    };
    if (onclick != null) {
        onclickHandler = (event: any) => {
            event.preventDefault();
            onclick();
            route.next(href);
        }
    }
    return (
        <a onclick={onclickHandler} href={href} class={className}>
            {children}
        </a>
    );
}
