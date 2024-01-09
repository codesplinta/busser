export const storageKey = '__STR_$__';
export const anEmptyArray = [];

export const mockEventBusPayload = { a: 1 };

export const mockCompositeObject = {
	notifications: [],
	read: 0,
	unread: 0
};

export const mockSearchFilterListSimpleStrings = [
	'Pixel One',
	'Note Two',
	'Props Three',
	'Compass Four',
	'Bot Five'
];

export const mockHttpResponseDetailsObject = {
    error: null,
    success: true,
    data: []
};

export const mockSearchFilterListSimpleObjects = [
	{ name: 'Pixel One', id: 'c210-bef5-ac43d79e-1da3-fa7e', status: 'active' },
	{ name: 'Note Two', id: 'ef88-ff24-d1a5cb40-08da-66df', status: 'inactive' },
	{
		name: 'Props Three',
		id: '23ea-1fca-92df77ae-dbc0-a4fc',
		status: 'inactive'
	},
	{ name: 'Compass Four', id: '66cd-8fab-345e-cba0-ed34-f01b', status: 'active' }
];

export const mockSearchFilterListComplexObjects = [
	{
		name: 'Pixel One',
		id: 'c210-bef5-ac43d79e-1da3-fa7e',
		metadata: { status: 'inactive' }
	},
	{
		name: 'Note Two',
		id: 'ef88-ff24-d1a5cb40-08da-66df',
		metadata: { status: 'inactive' }
	},
	{
		name: 'Props Three',
		id: '23ea-1fca-92df77ae-dbc0-a4fc',
		metadata: { status: 'active' }
	},
	{
		name: 'Compass Four',
		id: '66cd-8fab-345e-cba0-ed34-f01b',
		metadata: { status: 'active' }
	}
];

export const promptMessageForTest =
	'Are you sure you want to discard penidng changes ?';
