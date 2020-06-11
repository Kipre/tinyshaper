configs = {
	boardPadding: 40
}


class Canvas {
	constructor()
}




class BaseEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            length: props.length,
            width: props.width,
            thickness: props.thickness,
            continuity: props.continuity
        };
    }

    render() {
        return (
            <canvas class='controls'/>
        );
    }
}