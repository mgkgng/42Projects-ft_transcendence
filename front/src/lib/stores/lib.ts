export function uid() {
	const set = '0123456789abcdefghiklmnopqrstuvwxyz';
	
	let res: string = "";
	for (let i = 0; i < 16; i++)
		res += set[Math.floor(Math.random() * set.length)];
	return (res);
}

export	function format_date(date : string)
{
	let splt_hours : string[] = date.split("T")[1].split(":");
	let splt_date : string[] = date.split("T")[0].split("-");
	return (splt_hours[0] + ":" + splt_hours[1] + "-" + splt_date[2] + "/" + splt_date[1] + "/" + splt_date[0]);
}

export	function format_date_hours(date : string)
{
	let splt_hours : string[] = date.split("T")[1].split(":");
	return (splt_hours[0] + ":" + splt_hours[1]);
}