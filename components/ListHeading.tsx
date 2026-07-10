import {View, Text, Pressable} from 'react-native';

type ListHeadingProps = {
    title: string;
    onActionPress?: () => void;
};

const ListHeading = ({ title, onActionPress }: ListHeadingProps) => {
    return (
        <View className="list-head">
            <Text className="list-title" >{title}</Text>

            <Pressable className="list-action" onPress={onActionPress}>
                <Text className="list-action-text">View all</Text>
            </Pressable>
        </View>
    );
};

export default ListHeading;