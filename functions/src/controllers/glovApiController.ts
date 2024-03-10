import * as admin from 'firebase-admin';
const db = admin.firestore();

exports.requestHandler = async (req: any, res: any) => {
    const userID = res.locals.userID;
    const numericUserID = res.locals.numericUserID;
    const stream = req.query.stream;

    console.log("Stream: " + stream)

    const userRef = db.collection('users').doc(userID);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const group = parseInt(numericUserID.charAt(0));

    let rate_limit_left;
    let last_stream;
    let stream_seq = 1;
    let visit_count;

    if(stream !== "true" && stream !== "false") {
        res.status(400).send('Invalid stream parameter');
        return;
    }

    if (!userData) {
        try {
            await userRef.set({
                visit_count: 1,
                rate_limit_left: 4,
                last_stream: Date.now()
            });
            rate_limit_left = 4;
            last_stream = Date.now();
            visit_count = 1;

        } catch (error) {
            console.error('Error writing document: ', error);
            res.status(500).send('Error writing document');
            return;
        }
    }
    else {
        last_stream = userData.last_stream;
        rate_limit_left = userData.rate_limit_left;
        visit_count = userData.visit_count;
    }

    const now = Date.now();
    const time_diff = now - last_stream;

    if (time_diff < 60000) {
        if (rate_limit_left <= 0) {
            res.status(429).send('Rate limit exceeded');
            return;
        }
        rate_limit_left--;

        await userRef.update({
            rate_limit_left: rate_limit_left
        });
    }
    else {
        await userRef.update({
            rate_limit_left: 3,
            last_stream: now
        });
        rate_limit_left = 3;
    }

    await userRef.update({
        visit_count: visit_count + 1
    });

    for (let i = 0; i < 5; i++) {
        const ordinals = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
        const visit_count_str = visit_count.toString();
        const last_digit = visit_count_str.charAt(visit_count_str.length - 1);
        const ordinal = ordinals[last_digit-1];
        let visit_count_str_with_ordinal;
        if (visit_count_str.endsWith('11') || visit_count_str.endsWith('12') || visit_count_str.endsWith('13') || visit_count_str.endsWith('0')){
            visit_count_str_with_ordinal = visit_count_str + 'th';
        }
        else{
            visit_count_str_with_ordinal = visit_count_str + ordinal;
        }
        if (stream === "false") {
            res.status(200).send({
                message: 'Hello for the ' + visit_count_str_with_ordinal + ' time ' + userID + '! You are in group ' + group + '. You have ' + rate_limit_left + ' requests left within the minute.',
                group: group,
                rate_limit_left: rate_limit_left,
                stream_seq: 0
            });
        }
        else if (stream === "true") {
            const resObject = {
                message: 'Hello for the ' + visit_count_str_with_ordinal + ' time ' + userID + '! You are in group ' + group + '. You have ' + rate_limit_left + ' requests left within the minute.',
                group: group,
                rate_limit_left: rate_limit_left,
                stream_seq: stream_seq
            }
            res.write("data: " + JSON.stringify(resObject) + "\n\n");
            stream_seq++;
        }
    }
    return res.end();
};