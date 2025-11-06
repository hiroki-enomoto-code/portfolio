<?php

namespace App\Console\Commands;

use Carbon\Carbon;

use Illuminate\Console\Command;
use App\Http\Controllers\SlackController;
use App\Models\Users;

class CongratulationCommand extends Command
{
    protected $signature = 'congratulation:task';
    protected $description = 'Your task description';

    //private $channel = 'C097RQ7J8QK'; // テスト用
    private $channel = 'C08R632GNB1'; //宮崎全体チャンネル

    public function handle()
    {

        $slackController = new SlackController();

        $today = now()->format('m-d');
        $birthdayUsers = Users::where('birthday', $today)->get();
        $historyUsers = Users::whereRaw("DATE_FORMAT(history, '%m-%d') = ?", [$today])->get();

        if ($birthdayUsers->isEmpty() && $historyUsers->isEmpty()) {
            return response()->json(['message' => 'No users with birthday today'], 404);
        }

        $blocks = [];

        if (!$birthdayUsers->isEmpty()) {
            $birthday_mentions = $birthdayUsers->map(function ($user) {
                return "<@{$user->value}> {$user->name_ja}さん \n";
            })->join('');

            $blocks[] = [
                "type" => "section",
                "text" => [
                    "type" => "mrkdwn",
                    "text" => ":birthday: *お誕生日通知* :birthday:"
                ]
            ];
            $blocks[] = [
                "type" => "divider"
            ];
            $blocks[] = [
                "type" => "section",
                "text" => [
                    "type" => "mrkdwn",
                    "text" => "{$birthday_mentions}\n\nお誕生日おめでとうございます\n素敵な一日をお過ごしください！ :tada:"
                ]
            ];
            $blocks[] = ["type" => "section", "text" => ["type" => "mrkdwn", "text" => " "]];
            $blocks[] = ["type" => "section", "text" => ["type" => "mrkdwn", "text" => " "]];
            $blocks[] = ["type" => "section", "text" => ["type" => "mrkdwn", "text" => " "]];
        }

        if (!$historyUsers->isEmpty()) {
            $mentions = $historyUsers->map(function ($user) {
                try {
                    // historyカラムから勤続年数を計算
                    $joinDate = Carbon::parse($user->history);
                    $yearsOfService = $joinDate->diffInYears(now());

                    if( $yearsOfService < 1) {
                        return "<@{$user->value}> {$user->name_ja}さん ご入社記念日ありがとうございます。\n";
                    }

                    return "<@{$user->value}> {$user->name_ja}さん 勤続{$yearsOfService}年ありがとうございます。\n";
                } catch (\Exception $e) {
                    // 日付の解析に失敗した場合の処理
                    return "<@{$user->value}> {$user->name_ja}さん ご入社記念日ありがとうございます。\n";
                }
            })->join('');

            $blocks[] = [
                "type" => "section",
                "text" => [
                    "type" => "mrkdwn",
                    "text" => ":conoha-work: *勤続〇〇年通知！* :conoha-work:"
                ]
            ];
            $blocks[] = [
                "type" => "divider"
            ];
            $blocks[] = [
                "type" => "section",
                "text" => [
                    "type" => "mrkdwn",
                    "text" => "{$mentions}\n\n素敵な一日をお過ごしください！ :tada:"
                ]
            ];
        }

        $params = [
            'channel' => $this->channel,
            'blocks' => json_encode($blocks),
        ];

        $response = $slackController->makeRequest('chat.postMessage', $params);
    }
}