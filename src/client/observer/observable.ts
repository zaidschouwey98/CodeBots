type Callback<T> = (target: T) => void;

export default class Observable<T extends object> {
    private observers: Callback<T>[];
    public state: T;

    constructor(data: T) {
        this.observers = [];

        this.state = new Proxy(data, {
            set: (state, prop, value) => {
                state[prop] = value;
                this.notify();

                return true;
            },
        });
    }

    public observe(callback: Callback<T>) {
        this.observers.push(callback);
    }

    public notify() {
        this.observers.forEach((callback) => {
            callback(this.state);
        });
    }
}
