let $routes: string[] = [];

export type Route = {
	path: string,
	regex?: boolean,
	redirect?: string,

	children?: Route[],

	show?: Component<any, any>,
	if?: () => boolean,
	args?: any,
}

export default class Router {
	root: Route;
	el: HTMLElement;
	firstRoute: boolean;

	constructor(root: Route) {
		this.root = root;
		this.el = h("div") as HTMLElement;
		this.firstRoute = true;

		window.addEventListener("popstate", () => {
			this.route($routes.pop()!);
		});
	}

	render(el: HTMLElement): boolean {
		el.appendChild(this.el);
		return this.route(location.pathname);
	}

	route(path: string): boolean {
		let a = h("a", { href: path }) as HTMLAnchorElement;
		let pathname = new URL(a.href).pathname;

		const parsed = this._parse(pathname, this.root);
		// did not match
		if (parsed === pathname) return false;

		if (parsed.length === 0) {
			// matched fully
			this._push(pathname, this.root);
			return true;
		} else if (parsed.startsWith(":") && this.root.show) {
			this.root.show[parsed.slice(1)] = pathname;
			this._push(pathname, this.root);
			return true;
		}

		if (!this.root.children) return false;

		return this._route(pathname.replace(this.root.path, ""), pathname, this.root.children);
	}

	_parse(path: string, route: Route): string {
		return path.replace(route.regex ? new RegExp(route.path) : route.path, "")
	}

	_route(path: string, truePath: string, children: Route[]): boolean {
		for (const child of children) {
			const parsed = this._parse(path, child);
			if ((child.if ? child.if() : true) && parsed !== path) {
				// partially matched
				if (parsed.length === 0) {
					// matched
					this._push(truePath, child);
					return true;
				} else if (parsed.startsWith(":") && child.show) {
					child.show[parsed.slice(1)] = truePath;
					this._push(truePath, child);
					return true;
				}

				// try children instead
				if (child.children && this._route(parsed, truePath, child.children)) {
					return true;
				}
			}
		}
		return false;
	}

	_push(path: string, route: Route) {
		if (route.redirect) {
			this.route(route.redirect!);
		} else if (route.show) {
			// let any args on first route pass through, probably shouldn't be hacked in like this
			if (!this.firstRoute) {
				$routes.push(path);
				history.pushState({}, "", path);
			} else {
				this.firstRoute = false;
			}
			let el = h(route.show, route.args) as HTMLElement;
			this.el.replaceWith(el);
			this.el = el;
		}
	}
}
