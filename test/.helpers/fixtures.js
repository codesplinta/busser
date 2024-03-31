export const storageKey = '__STR_$__'
export const anEmptyArray = []

export const dummyEventBusPayload = { a: 1 }

export const dummyCompositeObject = {
	notifications: [],
	read: 0,
	unread: 0
}

export const dummyProps = { title: "Hello", id: "xWjud6538jSBudPiolcd" };

export const dummySearchFilterListSimpleStrings = [
	'Pixel One',
	'Note Two',
	'Props Three',
	'Compass Four',
	'Bot Five'
]

export const dummyHttpResponseDetailsObject = {
	error: null,
	success: true,
	data: []
}

export const dummySearchFilterListSimpleObjects = [
	{ name: 'Pixel One', id: 'c210-bef5-ac43d79e-1da3-fa7e', status: 'active', settled: false },
	{ name: 'Note Two', id: 'ef88-ff24-d1a5cb40-08da-66df', status: 'inactive', settled: false },
	{
		name: 'Props Three',
		id: '23ea-1fca-92df77ae-dbc0-a4fc',
		status: 'inactive',
		settled: true
	},
	{ name: 'Compass Four', id: '66cd-8fab-345e-cba0-ed34-f01b', status: 'active', settled: false }
]

export const dummySearchFilterListComplexObjects = [
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
]

export const dummyPromptMessageForTest =
	'Are you sure you want to discard penidng changes ?'
