const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
let currentQuestionIndex = 0;
let isAcceptingVotes = false;
const questions = [
    { text: "Q1. たばこを吸いますか？", options: ["吸っている", "吸わない", "以前は吸っていた"] },
    { text: "Q2. 分煙施設は必要？", options: ["不要", "あってもよい", "必要"] },
    { text: "Q3. 規制で解決？", options: ["解決する", "わからない", "解決しない"] },
    { text: "Q4. 税収活用", options: ["賛成", "反対", "どちらでもない"] },
    { text: "Q5. 税率が高いのは？", options: ["たばこ", "ビール", "ガソリン"] },
    { text: "Q6. 整備の主体は？", options: ["国・自治体", "企業", "官民共同", "利用者"] },
    { text: "Q7. 分煙施設は必要？(再)", options: ["不要", "あってもよい", "必要"] },
    { text: "Q8. 改善すべきこと？", options: ["マナー啓発", "施設充実", "規制強化", "官民対話"] }
];
let votes = new Array(questions[0].options.length).fill(0);
io.on('connection', (socket) => {
  socket.emit('stateUpdate', { question: questions[currentQuestionIndex], questionIndex: currentQuestionIndex, isAcceptingVotes: isAcceptingVotes, votes: votes, totalQuestions: questions.length });
  socket.on('adminChangeQuestion', (idx) => { if(idx>=0 && idx<questions.length) { currentQuestionIndex=idx; isAcceptingVotes=false; votes = new Array(questions[idx].options.length).fill(0); io.emit('stateUpdate', { question: questions[idx], questionIndex: idx, isAcceptingVotes: false, votes: votes, totalQuestions: questions.length }); } });
  socket.on('adminStartVoting', () => { isAcceptingVotes = true; io.emit('stateUpdate', { question: questions[currentQuestionIndex], questionIndex: currentQuestionIndex, isAcceptingVotes: true, votes: votes, totalQuestions: questions.length }); });
  socket.on('adminCloseVoting', () => { isAcceptingVotes = false; io.emit('stateUpdate', { question: questions[currentQuestionIndex], questionIndex: currentQuestionIndex, isAcceptingVotes: false, votes: votes, totalQuestions: questions.length }); });
  socket.on('submitVote', (optIdx) => { if(isAcceptingVotes) { votes[optIdx]++; io.emit('votesUpdated', { votes: votes }); } });
});
http.listen(PORT, '0.0.0.0', () => console.log('Server running on ' + PORT));
