import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "@/lib/useThemeSync";
import { shadowDialog } from "@/constants/shadows";
dayjs.extend(customParseFormat);

interface DatePickerProps {
  visible: boolean;
  value: string;
  onConfirm: (dateStr: string) => void;
  onCancel: () => void;
  title?: string;
  minDate?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({
  visible,
  value,
  onConfirm,
  onCancel,
  title = "Select Date",
  minDate,
}: DatePickerProps) {
  const parsed = dayjs(value, "MM/DD/YYYY", true);
  const isValid = parsed.isValid();
  const [viewMonth, setViewMonth] = useState(
    isValid ? parsed : dayjs()
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(
    isValid ? parsed.date() : null
  );

  const minParsed = minDate ? dayjs(minDate, "MM/DD/YYYY", true) : null;
  const { isDark } = useTheme();

  useEffect(() => {
    const parsed = dayjs(value, "MM/DD/YYYY", true);
    if (parsed.isValid()) {
      setViewMonth(parsed);
      setSelectedDay(parsed.date());
    }
  }, [value]);

  const year = viewMonth.year();
  const month = viewMonth.month();

  const monthLabel = viewMonth.format("MMMM YYYY");

  const daysInMonth = viewMonth.daysInMonth();
  const firstDayOfWeek = viewMonth.startOf("month").day();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const handlePrev = () => setViewMonth(viewMonth.subtract(1, "month"));
  const handleNext = () => setViewMonth(viewMonth.add(1, "month"));

  const handleDayPress = (day: number) => {
    const date = viewMonth.date(day);
    if (minParsed && date.isBefore(minParsed, "day")) return;
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    if (selectedDay === null) return;
    const dateStr = viewMonth.date(selectedDay).format("MM/DD/YYYY");
    onConfirm(dateStr);
  };

  const isDayDisabled = (day: number) => {
    if (minParsed) {
      return viewMonth.date(day).isBefore(minParsed, "day");
    }
    return false;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={onCancel}
      >
        <Pressable
          className="w-[340px] rounded-2xl bg-white dark:bg-card p-5"
          style={shadowDialog}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Text className="text-center text-base font-sans-bold text-primary mb-4">
            {title}
          </Text>

          {/* Month Navigator */}
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={handlePrev}
              className="size-9 items-center justify-center rounded-full bg-muted"
            >
              <Ionicons name="chevron-back" size={18} color={isDark ? "#ededed" : "#191919"} />
            </Pressable>
            <Text className="text-base font-sans-semibold text-primary">
              {monthLabel}
            </Text>
            <Pressable
              onPress={handleNext}
              className="size-9 items-center justify-center rounded-full bg-muted"
            >
              <Ionicons name="chevron-forward" size={18} color={isDark ? "#ededed" : "#191919"} />
            </Pressable>
          </View>

          {/* Weekday Headers */}
          <View className="flex-row mb-2">
            {WEEKDAYS.map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-xs font-sans-semibold text-muted-foreground">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap mb-4">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <View key={`empty-${i}`} className="w-[14.28%] aspect-square" />;
              }
              const disabled = isDayDisabled(day);
              const isSelected = selectedDay === day;
              const isToday = dayjs().date(day).month(month).year(year).isSame(dayjs(), "day");

              return (
                <Pressable
                  key={day}
                  onPress={() => handleDayPress(day)}
                  disabled={disabled}
                  className="w-[14.28%] aspect-square items-center justify-center"
                >
                  <View
                    className={clsx(
                      "size-9 items-center justify-center rounded-full",
                      isSelected && "bg-primary dark:bg-foreground",
                      !isSelected && isToday && "bg-accent/10",
                      disabled && "opacity-30",
                    )}
                  >
                    <Text
                      className={clsx(
                        "text-sm font-sans-semibold",
                        isSelected && "text-white dark:text-background",
                        !isSelected && !isToday && "text-primary",
                        !isSelected && isToday && "text-accent",
                      )}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 items-center rounded-xl border border-border py-3"
            >
              <Text className="text-sm font-sans-semibold text-muted-foreground">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={selectedDay === null}
              className={clsx(
                "flex-1 items-center rounded-xl bg-primary dark:bg-foreground py-3",
                selectedDay === null && "opacity-40",
              )}
            >
              <Text className="text-cta text-white dark:text-background">
                Confirm
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
