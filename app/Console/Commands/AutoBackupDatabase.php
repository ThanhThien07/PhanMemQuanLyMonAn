<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AutoBackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động sao lưu cấu trúc và dữ liệu cơ sở dữ liệu MySQL sang tệp SQL';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Bắt đầu sao lưu cơ sở dữ liệu...');

        $database = config('database.connections.mysql.database');

        try {
            $tables = DB::select('SHOW TABLES');
        } catch (\Exception $e) {
            $this->error('Không thể kết nối cơ sở dữ liệu để lấy danh sách bảng: '.$e->getMessage());

            return 1;
        }

        $tableKey = 'Tables_in_'.$database;

        $sql = "-- M&S Database Auto-Backup\n";
        $sql .= '-- Date: '.now()->toDateTimeString()."\n";
        $sql .= '-- Database: '.$database."\n\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $tableObj) {
            $tableArray = (array) $tableObj;
            $table = reset($tableArray); // Lấy phần tử đầu tiên (tên bảng), không phụ thuộc vào cách đặt tên cột của MySQL
            $this->info("Đang sao lưu bảng: {$table}");

            // 1. Lấy cấu trúc bảng
            try {
                $createTable = DB::select("SHOW CREATE TABLE `{$table}`");
                $createTableArray = (array) $createTable[0];
                $createSql = end($createTableArray); // Lấy định nghĩa cấu trúc bảng ở phần tử cuối

                $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
                $sql .= $createSql.";\n\n";
            } catch (\Exception $e) {
                $this->warn("Không thể lấy cấu trúc bảng {$table}: ".$e->getMessage());

                continue;
            }

            // 2. Lấy dữ liệu của bảng
            try {
                $rows = DB::table($table)->get();
                if ($rows->count() > 0) {
                    foreach ($rows as $row) {
                        $rowArray = (array) $row;
                        $keys = array_keys($rowArray);
                        $values = array_values($rowArray);

                        $escapedValues = array_map(function ($val) {
                            if (is_null($val)) {
                                return 'NULL';
                            }
                            // Sử dụng PDO quote để escape chuẩn xác và an toàn nhất chống lỗi cú pháp SQL
                            try {
                                return DB::getPdo()->quote($val);
                            } catch (\Exception $e) {
                                return "'".addslashes($val)."'";
                            }
                        }, $values);

                        $sql .= "INSERT INTO `{$table}` (`".implode('`, `', $keys).'`) VALUES ('.implode(', ', $escapedValues).");\n";
                    }
                    $sql .= "\n";
                }
            } catch (\Exception $e) {
                $this->warn("Không thể lấy dữ liệu bảng {$table}: ".$e->getMessage());
            }
        }

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

        $filename = 'backups/backup-'.now()->format('Y-m-d_H-i-s').'.sql';

        try {
            Storage::disk('local')->put($filename, $sql);
            $this->info("Sao lưu thành công! Tệp được lưu tại: storage/app/{$filename}");
        } catch (\Exception $e) {
            $this->error('Không thể ghi tệp sao lưu: '.$e->getMessage());

            return 1;
        }

        return 0;
    }
}
