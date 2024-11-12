import { Popup } from '~popup/components/Popup/index';
import { WithIndexStatus } from '~popup/components/WithIndexStatus/WithIndexStatus';
import './globals.css';

export default function PopupIndex() {
	return (
		<WithIndexStatus>
			<Popup />
		</WithIndexStatus>
	);
}
